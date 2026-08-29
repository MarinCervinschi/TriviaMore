import { z } from "zod";

export const classRefSchema = z.object({
	classId: z.string().uuid(),
	courseId: z.string().uuid(),
});

export const classIdSchema = z.object({ classId: z.string().uuid() });
export const questionIdSchema = z.object({ questionId: z.string().uuid() });

export const masteryScopeSchema = z
	.object({
		level: z.enum(["section", "class", "course"]),
		id: z.string().uuid(),
	})
	.optional();

export type MasteryScope = NonNullable<z.infer<typeof masteryScopeSchema>>;

export const masteryInputSchema = z
	.object({
		scope: masteryScopeSchema,
		/** Inclusive lower bound as a calendar day, `YYYY-MM-DD`. */
		from: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional(),
		mode: z.enum(["STUDY", "EXAM_SIMULATION"]).optional(),
	})
	.optional();

export type MasteryInput = NonNullable<z.infer<typeof masteryInputSchema>>;

export const updateProfileSchema = z.object({
	name: z.string().min(1, "Il nome è obbligatorio").max(100),
	image: z.string().url().nullable().optional(),
});

export const attemptFavoriteSchema = z.object({
	attemptId: z.string().uuid(),
	// The wanted value, not a blind flip: an optimistic click that arrives twice
	// must land on the same state, not undo itself.
	isFavorite: z.boolean(),
});
