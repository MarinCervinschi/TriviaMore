import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { getDb } from "@/db";
import {
	contentRequests,
	courseClasses,
	courses,
	notifications,
	questions,
	sections,
} from "@/db/schema";
import { assertSectionAccess } from "@/lib/auth/checks";
import { log } from "@/lib/logging/server";
import { createNotification, notifyAdminsInScope } from "@/lib/notifications/service";
import {
	Conflict,
	Forbidden,
	Invalid,
	NotFound,
	Unavailable,
} from "@/lib/server/errors";
import { rateLimiter } from "@/lib/server/rate-limits";
import { putObject } from "@/lib/storage/server";

import type { CreateRequestInput, UpdateReportInput } from "../schemas";
import type { ContentRequestType, ContentRequestWithMeta } from "../types";
import {
	assertOwnAttachment,
	findRequestOrThrow,
	generateTitle,
	parseSubmission,
	parseSubmittedContent,
	resolveTargetLabels,
	targetKey,
} from "./shared";

export const MAX_OPEN_REQUESTS_PER_USER = 30;

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

async function resolveTarget(
	userId: string,
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

	if (sectionId) {
		const [section] = await db
			.select({ classId: sections.classId })
			.from(sections)
			.where(eq(sections.id, sectionId))
			.limit(1);
		if (!section) throw new NotFound("Sezione non trovata");
		if (classId && classId !== section.classId) {
			throw new Invalid("La sezione non appartiene a questo insegnamento");
		}
		await assertSectionAccess(db, userId, sectionId);
		classId = section.classId;
	}

	if (!classId) return { sectionId, classId, courseId: null, departmentId: null };

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

async function assertBelowOpenCap(db: DbOrTx, userId: string) {
	const [open] = await db
		.select({ value: count() })
		.from(contentRequests)
		.where(
			and(
				eq(contentRequests.userId, userId),
				inArray(contentRequests.status, ["PENDING", "NEEDS_REVISION"])
			)
		);
	if (open.value >= MAX_OPEN_REQUESTS_PER_USER) {
		throw new Conflict(
			`Hai già ${MAX_OPEN_REQUESTS_PER_USER} richieste in attesa. Potrai inviarne altre quando saranno gestite.`
		);
	}
}

const ATTACHMENT_TYPES: Record<string, { type: string; magic: number[] }> = {
	pdf: { type: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
	docx: {
		type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		magic: [0x50, 0x4b, 0x03, 0x04],
	},
};

/** Stored before the request exists; the path it returns goes into the request's content. */
export async function uploadAttachment(
	userId: string,
	file: File
): Promise<{ filePath: string }> {
	await assertBelowOpenCap(getDb(), userId);
	if (!(await rateLimiter().checkAndReport("upload", { user: userId }))) {
		throw new Conflict("Hai caricato troppi file di recente. Riprova più tardi.");
	}

	const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
	const accepted = ATTACHMENT_TYPES[extension];
	const bytes = new Uint8Array(await file.arrayBuffer());
	if (!accepted || accepted.magic.some((byte, i) => bytes[i] !== byte)) {
		throw new Invalid("Formato non supportato. Carica un PDF o un DOCX.");
	}

	const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;
	try {
		await putObject("contributions", filePath, bytes, accepted.type);
	} catch (error) {
		log.error("Attachment of {UserId} not stored", { UserId: userId }, error);
		throw new Unavailable("Caricamento non riuscito. Riprova.");
	}
	return { filePath };
}

export async function createRequest(
	userId: string,
	input: CreateRequestInput
): Promise<{ id: string }> {
	const submitted = parseSubmission(input.submitted_content);
	assertOwnAttachment(userId, submitted);
	const target = await resolveTarget(
		userId,
		input,
		submitted.type === "report" ? submitted.question_id : null
	);

	// One transaction, so no admin is notified about a request that failed to insert.
	return getDb().transaction(async tx => {
		// Serializes one user's submissions, so two at once cannot both pass the cap.
		await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
		await assertBelowOpenCap(tx, userId);

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
	const submitted = parseSubmission(input.submitted_content);
	assertOwnAttachment(userId, submitted);

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

		// Its admin notifications go too, or they would link to nothing.
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
