import { z } from "zod";

// File upload submission: user uploads a file contribution
export const fileUploadSubmissionSchema = z.object({
	type: z.literal("file_upload"),
	file_name: z.string().min(1, "Il nome del file è obbligatorio").trim(),
	file_path: z.string().min(1, "Il percorso del file è obbligatorio"),
	file_size: z.number().min(0),
	comment: z.string().max(1000).nullable(),
});

// ─── Stored JSONB validation (content only, no target fields) ───

const storedSectionSchema = z.object({
	type: z.literal("section"),
	name: z.string().min(1),
	description: z.string(),
});

const storedQuestionsSchema = z.object({
	type: z.literal("questions"),
	questions: z.array(
		z.object({
			content: z.string().min(1),
			question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
			options: z.array(z.string()).nullable(),
			correct_answer: z.array(z.string()),
			explanation: z.string().nullable(),
			difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
		})
	),
});

const storedReportSchema = z.object({
	type: z.literal("report"),
	question_id: z.string().min(1),
	question_content: z.string(),
	reasons: z.array(z.string()).min(1),
	comment: z.string().nullable(),
});

export const storedContentSchema = z.discriminatedUnion("type", [
	storedSectionSchema,
	storedQuestionsSchema,
	storedReportSchema,
	fileUploadSubmissionSchema,
]);

// Rejecting or asking for changes. Approving goes through approveRequestFn, and
// acknowledging a report or a file through acknowledgeRequestFn.
export const handleRequestSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(["REJECTED", "NEEDS_REVISION"]),
	admin_note: z.string().max(1000).trim().optional(),
});

// ─── Server function inputs ───

export const requestIdSchema = z.object({ id: z.string().uuid() });

export const createRequestSchema = z.object({
	type: z.enum(["section", "questions", "report", "file_upload"]),
	target_class_id: z.string().uuid().optional(),
	target_section_id: z.string().uuid().optional(),
	submitted_content: z.unknown(),
});

export const reviseRequestSchema = z.object({
	id: z.string().uuid(),
	submitted_content: z.unknown(),
});

export const updateReportSchema = z
	.object({
		id: z.string().uuid(),
		reasons: z
			.array(z.enum(["errata", "imprecisa", "fuori_contesto", "altro"]))
			.min(1, "Seleziona almeno un motivo valido"),
		comment: z.string().max(1000).nullable(),
	})
	.refine(data => !data.reasons.includes("altro") || !!data.comment?.trim(), {
		message: "Il commento è obbligatorio quando selezioni 'Altro'",
		path: ["comment"],
	});

export const acknowledgeRequestSchema = z.object({
	id: z.string().uuid(),
	admin_note: z.string().max(2000).optional(),
});

export const fileDownloadSchema = z.object({ filePath: z.string().min(1) });

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
