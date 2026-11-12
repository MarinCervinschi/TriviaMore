import { z } from "zod";

import { formFileSchema } from "@/lib/storage/schemas";

export const fileUploadSubmissionSchema = z.object({
	type: z.literal("file_upload"),
	file_name: z.string().min(1, "Il nome del file è obbligatorio").trim(),
	file_path: z.string().min(1, "Il percorso del file è obbligatorio"),
	file_size: z.number().min(0),
	comment: z.string().max(1000).nullable(),
});

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

const MAX_QUESTIONS_PER_REQUEST = 100;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const text = (max: number, message: string) => z.string().max(max, message);

const submittedQuestionSchema = z.object({
	content: text(2000, "Il testo di una domanda supera i 2000 caratteri").min(1),
	question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
	options: z
		.array(text(500, "Un'opzione supera i 500 caratteri"))
		.max(40, "Una domanda ha più di 40 opzioni")
		.nullable(),
	correct_answer: z
		.array(text(500, "Una risposta corretta supera i 500 caratteri"))
		.max(6, "Una domanda ha più di 6 risposte corrette"),
	explanation: text(1000, "Una spiegazione supera i 1000 caratteri").nullable(),
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

/** What a user may submit; stored rows are read back with the looser `storedContentSchema`. */
export const submissionSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("section"),
		name: text(100, "Il nome della sezione supera i 100 caratteri").min(1),
		description: text(500, "La descrizione supera i 500 caratteri"),
	}),
	z.object({
		type: z.literal("questions"),
		questions: z
			.array(submittedQuestionSchema)
			.max(
				MAX_QUESTIONS_PER_REQUEST,
				`Una proposta può contenere al massimo ${MAX_QUESTIONS_PER_REQUEST} domande`
			),
	}),
	z.object({
		type: z.literal("report"),
		question_id: z.string().uuid(),
		question_content: text(5000, "Il testo della domanda segnalata è troppo lungo"),
		reasons: z
			.array(z.enum(["errata", "imprecisa", "fuori_contesto", "altro"]))
			.min(1)
			.max(4, "Troppi motivi di segnalazione"),
		comment: text(1000, "Il commento supera i 1000 caratteri").nullable(),
	}),
	fileUploadSubmissionSchema.extend({
		file_name: text(255, "Il nome del file è troppo lungo").min(1).trim(),
		file_path: z.string().min(1).max(200, "Percorso file non valido"),
		file_size: z
			.number()
			.int()
			.min(0)
			.max(MAX_ATTACHMENT_BYTES, "Il file supera il limite di 10 MB"),
	}),
]);

export const handleRequestSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(["REJECTED", "NEEDS_REVISION"]),
	admin_note: z.string().max(1000).trim().optional(),
});

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

export const attachmentFileSchema = formFileSchema(
	10 * 1024 * 1024,
	"Il file supera il limite di 10 MB"
);

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
