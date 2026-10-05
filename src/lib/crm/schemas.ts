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
	curriculum: z.string().trim().min(1).max(200).nullable().optional(),
});

export type SetEnrollmentInput = z.infer<typeof setEnrollmentSchema>;
