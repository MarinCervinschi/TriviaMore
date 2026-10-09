import { z } from "zod";

import { academicYearOf } from "@/lib/catalog/academic-year";

export const EARLIEST_START_YEAR = 1990;

export const setEnrollmentSchema = z.object({
	courseId: z.string().uuid(),
	startYear: z
		.number()
		.int()
		.min(EARLIEST_START_YEAR)
		.refine(
			year => year <= academicYearOf(new Date()),
			"Anno di immatricolazione futuro"
		)
		.nullable()
		.optional(),
	curriculumId: z.string().uuid().nullable().optional(),
});

export const curriculumOptionsSchema = z.object({
	courseId: z.string().uuid(),
	startYear: z.number().int(),
});

export type SetEnrollmentInput = z.infer<typeof setEnrollmentSchema>;

export const careerSettingsSchema = z.object({
	honoursGrade: z.number().min(30).max(33).default(30),
	honoursBonus: z.number().min(0).max(2).default(0),
	honoursBonusCap: z.number().min(0).max(10).default(0),
	thesis: z.number().min(0).max(15).default(0),
	inCorso: z.number().min(0).max(5).default(0),
	erasmus: z.number().min(0).max(5).default(0),
	other: z.number().min(0).max(10).default(0),
});

export type CareerSettings = z.infer<typeof careerSettingsSchema>;

const examName = z.string().trim().min(1).max(200);
const examCfu = z.number().int().min(1).max(60);

/** A free entry, or a pick from one of the plan's choice groups by its plan code. */
export const addCareerExamSchema = z.union([
	z.object({
		name: examName,
		cfu: examCfu,
		classYear: z.number().int().min(1).max(6).nullable().optional(),
		graded: z.boolean().default(true),
		/** The catalogue class it was picked from, when it was not typed by hand. */
		classId: z.string().uuid().nullable().optional(),
		external: z.boolean().default(false),
	}),
	z.object({ groupCode: z.string().min(1), planCode: z.string().min(1) }),
]);

export const updateCareerExamSchema = z.object({
	id: z.string().uuid(),
	name: examName.optional(),
	cfu: examCfu.optional(),
	classYear: z.number().int().min(1).max(6).nullable().optional(),
	graded: z.boolean().optional(),
	external: z.boolean().optional(),
	status: z.enum(["PLANNED", "PASSED", "REJECTED"]).optional(),
	grade: z.number().int().min(18).max(30).nullable().optional(),
	honours: z.boolean().optional(),
	examDate: z.string().date().nullable().optional(),
});

/** The full pick for some choice groups: what is listed stays or is added, the rest of each group goes. */
export const setCareerChoicesSchema = z.object({
	choices: z
		.array(
			z.object({
				groupCode: z.string().min(1),
				planCodes: z.array(z.string().min(1)).max(50),
			})
		)
		.min(1)
		.max(100),
});

export const idSchema = z.object({ id: z.string().uuid() });

export type AddCareerExamInput = z.infer<typeof addCareerExamSchema>;
export type UpdateCareerExamInput = z.infer<typeof updateCareerExamSchema>;
export type SetCareerChoicesInput = z.infer<typeof setCareerChoicesSchema>;

const isoDay = z.string().date();
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Orario non valido");

export const createSittingSchema = z.object({
	examId: z.string().uuid(),
	date: isoDay,
	label: z.string().trim().max(40).nullable().optional(),
	importance: z.number().int().min(1).max(3).default(2),
	chosen: z.boolean().default(false),
});

export const updateSittingSchema = z.object({
	id: z.string().uuid(),
	date: isoDay.optional(),
	label: z.string().trim().max(40).nullable().optional(),
	importance: z.number().int().min(1).max(3).optional(),
	chosen: z.boolean().optional(),
});

export const ENTRY_COLORS = [
	"chart-1",
	"chart-2",
	"chart-3",
	"chart-4",
	"chart-5",
] as const;
export type EntryColor = (typeof ENTRY_COLORS)[number];

const color = z.enum(ENTRY_COLORS).nullable().optional();

const eventFields = {
	title: z.string().trim().min(1).max(120),
	date: isoDay,
	endDate: isoDay.nullable().optional(),
	startTime: clock.nullable().optional(),
	endTime: clock.nullable().optional(),
	notes: z.string().trim().max(2000).nullable().optional(),
	examId: z.string().uuid().nullable().optional(),
	color,
	recurrence: z
		.string()
		.regex(
			/^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)(;[A-Z]+=[A-Z0-9,+-]+)*$/,
			"Ripetizione non valida"
		)
		.max(200)
		.nullable()
		.optional(),
};

const timesInOrder = (value: {
	date?: string;
	endDate?: string | null;
	startTime?: string | null;
	endTime?: string | null;
}) => {
	if (value.endDate && value.date && value.endDate <= value.date) return false;
	if (!value.endTime) return true;
	return (
		Boolean(value.startTime) &&
		(Boolean(value.endDate) || value.endTime > value.startTime!)
	);
};

export const createEventSchema = z
	.object(eventFields)
	.refine(timesInOrder, "La fine viene prima dell'inizio");

export const updateEventSchema = z
	.object({ id: z.string().uuid(), ...eventFields })
	.partial({ title: true, date: true });

export type CreateSittingInput = z.infer<typeof createSittingSchema>;
export type UpdateSittingInput = z.infer<typeof updateSittingSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

const taskFields = {
	title: z.string().trim().min(1).max(200),
	notes: z.string().trim().max(2000).nullable().optional(),
	dueDate: isoDay,
	dueTime: clock.nullable().optional(),
	endTime: clock.nullable().optional(),
	done: z.boolean().optional(),
	color,
	examId: z.string().uuid().nullable().optional(),
};

const endAfterStart = (value: { dueTime?: string | null; endTime?: string | null }) =>
	!value.endTime || (Boolean(value.dueTime) && value.endTime > value.dueTime!);

export const createTaskSchema = z
	.object(taskFields)
	.refine(endAfterStart, "La fine viene prima dell'inizio");

export const updateTaskSchema = z
	.object({ id: z.string().uuid(), ...taskFields })
	.partial({ title: true, dueDate: true });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
