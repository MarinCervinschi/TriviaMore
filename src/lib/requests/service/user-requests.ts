import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import {
	contentRequests,
	courseClasses,
	courses,
	notifications,
	questions,
	sections,
} from "@/db/schema";
import { createNotification, notifyAdminsInScope } from "@/lib/notifications/service";
import { Conflict, Forbidden, Invalid, NotFound } from "@/lib/server/errors";

import type { CreateRequestInput, UpdateReportInput } from "../schemas";
import type { ContentRequestType, ContentRequestWithMeta } from "../types";
import {
	findRequestOrThrow,
	generateTitle,
	parseSubmittedContent,
	resolveTargetLabels,
	targetKey,
} from "./shared";

const REQUEST_TYPE: Record<CreateRequestInput["type"], ContentRequestType> = {
	section: "NEW_SECTION",
	questions: "NEW_QUESTIONS",
	report: "REPORT",
	file_upload: "FILE_UPLOAD",
};

export async function getUserRequests(
	userId: string
): Promise<ContentRequestWithMeta[]> {
	const db = getDb();

	const rows = await db
		.select()
		.from(contentRequests)
		.where(eq(contentRequests.userId, userId))
		.orderBy(desc(contentRequests.createdAt));

	const labels = await resolveTargetLabels(db, rows);

	return rows.map(({ submittedContent, ...row }) => ({
		...row,
		targetLabel: labels.get(targetKey(row)) ?? "Sconosciuto",
		submitted: parseSubmittedContent(submittedContent),
	}));
}

// Fills in the hierarchy above whatever the user picked, so scoping and
// breadcrumbs have every level available without walking the catalog again.
async function resolveTarget(
	input: CreateRequestInput,
	reportedQuestionId: string | null
) {
	const db = getDb();

	let sectionId = input.target_section_id ?? null;
	let classId = input.target_class_id ?? null;

	if (reportedQuestionId) {
		const [question] = await db
			.select({ sectionId: questions.sectionId })
			.from(questions)
			.where(eq(questions.id, reportedQuestionId))
			.limit(1);
		if (question) sectionId = question.sectionId;
	}

	if (sectionId && !classId) {
		const [section] = await db
			.select({ classId: sections.classId })
			.from(sections)
			.where(eq(sections.id, sectionId))
			.limit(1);
		if (!section) throw new NotFound("Sezione non trovata");
		classId = section.classId;
	}

	if (!classId) return { sectionId, classId, courseId: null, departmentId: null };

	// The primary course of the class, the same rule breadcrumbs and notification
	// routing use.
	const [link] = await db
		.select({ courseId: courses.id, departmentId: courses.departmentId })
		.from(courseClasses)
		.innerJoin(courses, eq(courses.id, courseClasses.courseId))
		.where(eq(courseClasses.classId, classId))
		.orderBy(courseClasses.position)
		.limit(1);

	return {
		sectionId,
		classId,
		courseId: link?.courseId ?? null,
		departmentId: link?.departmentId ?? null,
	};
}

export async function createRequest(
	userId: string,
	input: CreateRequestInput
): Promise<{ id: string }> {
	const submitted = parseSubmittedContent(input.submitted_content);
	const target = await resolveTarget(
		input,
		submitted.type === "report" ? submitted.question_id : null
	);

	// The request and the notifications it triggers land together: an admin
	// notified about a request that failed to insert would link to nothing.
	return getDb().transaction(async tx => {
		const [request] = await tx
			.insert(contentRequests)
			.values({
				userId,
				requestType: REQUEST_TYPE[input.type],
				submittedContent: submitted,
				targetDepartmentId: target.departmentId,
				targetCourseId: target.courseId,
				targetClassId: target.classId,
				targetSectionId: target.sectionId,
			})
			.returning({ id: contentRequests.id });

		await notifyAdminsInScope(tx, {
			id: request.id,
			title: generateTitle(submitted),
			departmentId: target.departmentId,
			courseId: target.courseId,
			classId: target.classId,
			sectionId: target.sectionId,
		});

		return { id: request.id };
	});
}

export async function reviseRequest(
	userId: string,
	input: { id: string; submitted_content: unknown }
) {
	const submitted = parseSubmittedContent(input.submitted_content);

	await getDb().transaction(async tx => {
		const existing = await findRequestOrThrow(tx, input.id);
		if (existing.userId !== userId) throw new Forbidden("Non autorizzato");
		if (existing.status !== "NEEDS_REVISION") {
			throw new Conflict("La proposta non è modificabile");
		}

		await tx
			.update(contentRequests)
			.set({
				status: "PENDING",
				submittedContent: submitted,
				adminNote: null,
			})
			.where(eq(contentRequests.id, input.id));

		if (existing.handledBy) {
			await createNotification(tx, {
				userId: existing.handledBy,
				type: "REQUEST_REVISED",
				title: "Proposta aggiornata",
				body: generateTitle(submitted),
				referenceId: input.id,
				referenceType: "content_request",
				link: `/admin/requests/${input.id}`,
			});
		}
	});
}

export async function updateReport(userId: string, input: UpdateReportInput) {
	await getDb().transaction(async tx => {
		const request = await findRequestOrThrow(tx, input.id);
		if (request.userId !== userId) throw new Forbidden("Non autorizzato");
		if (request.requestType !== "REPORT") {
			throw new Invalid("Solo le segnalazioni possono essere modificate qui");
		}
		if (request.status !== "PENDING") {
			throw new Conflict(
				"La segnalazione è già stata gestita e non può essere modificata"
			);
		}

		const existing = parseSubmittedContent(request.submittedContent);
		if (existing.type !== "report") {
			throw new Invalid("Tipo di richiesta non valido");
		}

		await tx
			.update(contentRequests)
			.set({
				submittedContent: {
					...existing,
					reasons: input.reasons,
					comment: input.comment?.trim() || null,
				},
			})
			.where(eq(contentRequests.id, input.id));
	});
}

export async function deleteReport(userId: string, id: string) {
	await getDb().transaction(async tx => {
		const request = await findRequestOrThrow(tx, id);
		if (request.userId !== userId) throw new Forbidden("Non autorizzato");
		if (request.requestType !== "REPORT") {
			throw new Invalid("Solo le segnalazioni possono essere eliminate qui");
		}
		if (request.status !== "PENDING") {
			throw new Conflict(
				"La segnalazione è già stata gestita e non può essere eliminata"
			);
		}

		// The admin notifications pointing at it go with it, or they would link to a
		// request that no longer exists.
		await tx
			.delete(notifications)
			.where(
				and(
					eq(notifications.referenceId, id),
					eq(notifications.referenceType, "content_request")
				)
			);

		await tx.delete(contentRequests).where(eq(contentRequests.id, id));
	});
}
