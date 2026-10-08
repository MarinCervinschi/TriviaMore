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
	}),
	z.object({ groupCode: z.string().min(1), planCode: z.string().min(1) }),
]);

export const updateCareerExamSchema = z.object({
	id: z.string().uuid(),
	name: examName.optional(),
	cfu: examCfu.optional(),
	classYear: z.number().int().min(1).max(6).nullable().optional(),
	graded: z.boolean().optional(),
	status: z.enum(["PLANNED", "PASSED", "REJECTED"]).optional(),
	grade: z.number().int().min(18).max(30).nullable().optional(),
	honours: z.boolean().optional(),
	examDate: z.string().date().nullable().optional(),
});

export const careerExamIdSchema = z.object({ id: z.string().uuid() });

export type AddCareerExamInput = z.infer<typeof addCareerExamSchema>;
export type UpdateCareerExamInput = z.infer<typeof updateCareerExamSchema>;
