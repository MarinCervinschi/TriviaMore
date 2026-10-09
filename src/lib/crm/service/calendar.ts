import { and, asc, eq, inArray, ne } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { getDb } from "@/db";
import { calendarEvents, careerExams, examSittings, tasks } from "@/db/schema";
import { Invalid, NotFound } from "@/lib/server/errors";

import { findCurrentEnrollment } from "../db/enrollments";
import type {
	CreateEventInput,
	CreateSittingInput,
	CreateTaskInput,
	EntryColor,
	UpdateEventInput,
	UpdateSittingInput,
	UpdateTaskInput,
} from "../schemas";
import type {
	CalendarData,
	CalendarPersonalEvent,
	CalendarSitting,
	ExamSitting,
} from "../types";

const clock = (value: string | null) => (value ? value.slice(0, 5) : null);

/** The exams of the user's current record; empty without an enrolment. */
async function recordExams(db: DbOrTx, userId: string) {
	const enrollment = await findCurrentEnrollment(db, userId);
	if (!enrollment) return [];
	return db
		.select({
			id: careerExams.id,
			name: careerExams.name,
			cfu: careerExams.cfu,
			status: careerExams.status,
		})
		.from(careerExams)
		.where(eq(careerExams.enrollmentId, enrollment.id))
		.orderBy(
			asc(careerExams.classYear),
			asc(careerExams.position),
			asc(careerExams.name)
		);
}

/** The exam, when it belongs to the user's current record. */
async function requireOwnExam(db: DbOrTx, userId: string, examId: string) {
	const exams = await recordExams(db, userId);
	const exam = exams.find(row => row.id === examId);
	if (!exam) throw new NotFound("Esame non trovato nel libretto");
	return exam;
}

async function requireOwnSitting(
	db: DbOrTx,
	userId: string,
	id: string
): Promise<ExamSitting> {
	const [sitting] = await db.select().from(examSittings).where(eq(examSittings.id, id));
	if (!sitting) throw new NotFound("Appello non trovato");
	await requireOwnExam(db, userId, sitting.careerExamId);
	return sitting;
}

/** Choosing an appello releases the one the exam had before. */
/** Unchooses the exam's other appelli; the unique index allows one chosen per exam. */
async function releaseChoices(db: DbOrTx, examId: string, keep?: string) {
	await db
		.update(examSittings)
		.set({ chosen: false })
		.where(
			and(
				eq(examSittings.careerExamId, examId),
				eq(examSittings.chosen, true),
				keep ? ne(examSittings.id, keep) : undefined
			)
		);
}

export async function getCalendar(userId: string): Promise<CalendarData> {
	const db = getDb();
	const exams = await recordExams(db, userId);
	const examById = new Map(exams.map(exam => [exam.id, exam]));

	const [sittings, events, taskRows] = await Promise.all([
		exams.length === 0
			? Promise.resolve([] as ExamSitting[])
			: db
					.select()
					.from(examSittings)
					.where(
						inArray(
							examSittings.careerExamId,
							exams.map(exam => exam.id)
						)
					)
					.orderBy(asc(examSittings.date)),
		db
			.select()
			.from(calendarEvents)
			.where(eq(calendarEvents.userId, userId))
			.orderBy(asc(calendarEvents.date), asc(calendarEvents.startTime)),
		db
			.select()
			.from(tasks)
			.where(eq(tasks.userId, userId))
			.orderBy(asc(tasks.dueDate), asc(tasks.dueTime), asc(tasks.createdAt)),
	]);

	return {
		sittings: sittings.map(
			(row): CalendarSitting => ({
				id: row.id,
				examId: row.careerExamId,
				examName: examById.get(row.careerExamId)?.name ?? "",
				examPassed: examById.get(row.careerExamId)?.status === "PASSED",
				date: row.date,
				label: row.label,
				importance: row.importance,
				chosen: row.chosen,
			})
		),
		events: events.map(
			(row): CalendarPersonalEvent => ({
				id: row.id,
				title: row.title,
				date: row.date,
				endDate: row.endDate,
				startTime: clock(row.startTime),
				endTime: clock(row.endTime),
				notes: row.notes,
				recurrence: row.recurrence,
				color: row.color as EntryColor | null,
				examId:
					row.careerExamId && examById.has(row.careerExamId) ? row.careerExamId : null,
				examName: row.careerExamId
					? (examById.get(row.careerExamId)?.name ?? null)
					: null,
			})
		),
		tasks: taskRows.map(row => ({
			id: row.id,
			title: row.title,
			notes: row.notes,
			dueDate: row.dueDate,
			dueTime: clock(row.dueTime),
			endTime: clock(row.endTime),
			done: row.done,
			color: row.color as EntryColor | null,
			examId:
				row.careerExamId && examById.has(row.careerExamId) ? row.careerExamId : null,
			examName: row.careerExamId
				? (examById.get(row.careerExamId)?.name ?? null)
				: null,
		})),
		exams: exams.map(exam => ({
			id: exam.id,
			name: exam.name,
			cfu: exam.cfu,
			passed: exam.status === "PASSED",
		})),
	};
}

export async function createSitting(userId: string, input: CreateSittingInput) {
	await getDb().transaction(async tx => {
		await requireOwnExam(tx, userId, input.examId);
		if (input.chosen) await releaseChoices(tx, input.examId);
		await tx.insert(examSittings).values({
			careerExamId: input.examId,
			date: input.date,
			label: input.label || null,
			importance: input.importance,
			chosen: input.chosen,
		});
	});
}

export async function updateSitting(
	userId: string,
	{ id, ...patch }: UpdateSittingInput
) {
	await getDb().transaction(async tx => {
		const current = await requireOwnSitting(tx, userId, id);
		if (patch.chosen) await releaseChoices(tx, current.careerExamId, id);
		await tx
			.update(examSittings)
			.set({
				date: patch.date ?? current.date,
				label: patch.label === undefined ? current.label : patch.label || null,
				importance: patch.importance ?? current.importance,
				chosen: patch.chosen ?? current.chosen,
			})
			.where(eq(examSittings.id, id));
	});
}

export async function removeSitting(userId: string, id: string): Promise<void> {
	const db = getDb();
	await requireOwnSitting(db, userId, id);
	await db.delete(examSittings).where(eq(examSittings.id, id));
}

async function checkEventExam(
	db: DbOrTx,
	userId: string,
	examId: string | null | undefined
) {
	if (examId) await requireOwnExam(db, userId, examId);
}

export async function createEvent(userId: string, input: CreateEventInput) {
	const db = getDb();
	await checkEventExam(db, userId, input.examId);
	await db.insert(calendarEvents).values({
		userId,
		title: input.title,
		date: input.date,
		endDate: input.endDate ?? null,
		startTime: input.startTime ?? null,
		endTime: input.startTime ? (input.endTime ?? null) : null,
		notes: input.notes || null,
		recurrence: input.recurrence ?? null,
		color: input.color ?? null,
		careerExamId: input.examId ?? null,
	});
}

export async function updateEvent(userId: string, { id, ...patch }: UpdateEventInput) {
	const db = getDb();
	const [current] = await db
		.select()
		.from(calendarEvents)
		.where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)));
	if (!current) throw new NotFound("Evento non trovato");
	await checkEventExam(db, userId, patch.examId);

	const date = patch.date ?? current.date;
	const endDate = patch.endDate === undefined ? current.endDate : patch.endDate;
	const startTime =
		patch.startTime === undefined ? clock(current.startTime) : patch.startTime;
	const endTime = !startTime
		? null
		: patch.endTime === undefined
			? clock(current.endTime)
			: patch.endTime;
	if (endDate && endDate <= date) {
		throw new Invalid("L'ultimo giorno deve venire dopo il primo");
	}
	if (startTime && endTime && !endDate && endTime <= startTime) {
		throw new Invalid("La fine viene prima dell'inizio");
	}

	await db
		.update(calendarEvents)
		.set({
			title: patch.title ?? current.title,
			date,
			endDate,
			startTime,
			endTime,
			notes: patch.notes === undefined ? current.notes : patch.notes || null,
			recurrence:
				patch.recurrence === undefined ? current.recurrence : patch.recurrence,
			color: patch.color === undefined ? current.color : patch.color,
			careerExamId: patch.examId === undefined ? current.careerExamId : patch.examId,
		})
		.where(eq(calendarEvents.id, id));
}

export async function removeEvent(userId: string, id: string): Promise<void> {
	const removed = await getDb()
		.delete(calendarEvents)
		.where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
		.returning({ id: calendarEvents.id });
	if (removed.length === 0) throw new NotFound("Evento non trovato");
}

const doneAtFor = (done: boolean, previous: string | null) =>
	done ? (previous ?? new Date().toISOString()) : null;

export async function createTask(userId: string, input: CreateTaskInput) {
	const db = getDb();
	await checkEventExam(db, userId, input.examId);
	const done = input.done ?? false;
	await db.insert(tasks).values({
		userId,
		title: input.title,
		notes: input.notes || null,
		dueDate: input.dueDate,
		dueTime: input.dueTime ?? null,
		endTime: input.dueTime ? (input.endTime ?? null) : null,
		done,
		doneAt: doneAtFor(done, null),
		color: input.color ?? null,
		careerExamId: input.examId ?? null,
	});
}

export async function updateTask(userId: string, { id, ...patch }: UpdateTaskInput) {
	const db = getDb();
	const [current] = await db
		.select()
		.from(tasks)
		.where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
	if (!current) throw new NotFound("Task non trovata");
	await checkEventExam(db, userId, patch.examId);

	const dueTime = patch.dueTime === undefined ? clock(current.dueTime) : patch.dueTime;
	const endTime = !dueTime
		? null
		: patch.endTime === undefined
			? clock(current.endTime)
			: patch.endTime;
	if (endTime && endTime <= dueTime!)
		throw new Invalid("La fine viene prima dell'inizio");
	const done = patch.done ?? current.done;

	await db
		.update(tasks)
		.set({
			title: patch.title ?? current.title,
			notes: patch.notes === undefined ? current.notes : patch.notes || null,
			dueDate: patch.dueDate ?? current.dueDate,
			dueTime,
			endTime,
			done,
			doneAt: doneAtFor(done, current.doneAt),
			color: patch.color === undefined ? current.color : patch.color,
			careerExamId: patch.examId === undefined ? current.careerExamId : patch.examId,
		})
		.where(eq(tasks.id, id));
}

export async function removeTask(userId: string, id: string): Promise<void> {
	const removed = await getDb()
		.delete(tasks)
		.where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
		.returning({ id: tasks.id });
	if (removed.length === 0) throw new NotFound("Task non trovata");
}
