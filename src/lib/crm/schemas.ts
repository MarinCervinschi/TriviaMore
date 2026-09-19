import { z } from "zod";

const EARLIEST_START_YEAR = 1990;

export const setEnrollmentSchema = z.object({
	courseId: z.string().uuid(),
	startYear: z
		.number()
		.int()
		.min(EARLIEST_START_YEAR)
		.max(new Date().getFullYear() + 1)
		.nullable()
		.optional(),
	curriculum: z.string().trim().min(1).max(200).nullable().optional(),
});

export type SetEnrollmentInput = z.infer<typeof setEnrollmentSchema>;
