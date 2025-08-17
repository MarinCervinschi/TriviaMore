import { z } from "zod";

// Department validation schemas
export const departmentSchema = z.object({
	name: z
		.string()
		.min(2, "Il nome deve essere di almeno 2 caratteri")
		.max(100, "Il nome non può superare i 100 caratteri")
		.trim(),
	code: z
		.string()
		.min(2, "Il codice deve essere di almeno 2 caratteri")
		.max(10, "Il codice non può superare i 10 caratteri")
		.regex(
			/^[A-Z0-9_-]+$/,
			"Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore"
		)
		.trim(),
	description: z
		.string()
		.max(500, "La descrizione non può superare i 500 caratteri")
		.optional()
		.or(z.literal("")),
	position: z
		.number()
		.int("La posizione deve essere un numero intero")
		.min(0, "La posizione deve essere maggiore o uguale a 0")
		.optional(),
});

// Course validation schemas
export const courseSchema = z.object({
	name: z
		.string()
		.min(2, "Il nome deve essere di almeno 2 caratteri")
		.max(100, "Il nome non può superare i 100 caratteri")
		.trim(),
	code: z
		.string()
		.min(2, "Il codice deve essere di almeno 2 caratteri")
		.max(15, "Il codice non può superare i 15 caratteri")
		.regex(
			/^[A-Z0-9_-]+$/,
			"Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore"
		)
		.trim(),
	description: z
		.string()
		.max(500, "La descrizione non può superare i 500 caratteri")
		.optional()
		.or(z.literal("")),
	departmentId: z.string().min(1, "Il dipartimento è obbligatorio"),
	courseType: z.enum(["BACHELOR", "MASTER"], {
		message: "Il tipo di corso è obbligatorio. Seleziona BACHELOR o MASTER",
	}),
	position: z
		.number()
		.int("La posizione deve essere un numero intero")
		.min(0, "La posizione deve essere maggiore o uguale a 0")
		.optional(),
});

// Class validation schemas
export const classSchema = z.object({
	name: z
		.string()
		.min(2, "Il nome deve essere di almeno 2 caratteri")
		.max(100, "Il nome non può superare i 100 caratteri")
		.trim(),
	code: z
		.string()
		.min(2, "Il codice deve essere di almeno 2 caratteri")
		.max(15, "Il codice non può superare i 15 caratteri")
		.regex(
			/^[A-Z0-9_-]+$/,
			"Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore"
		)
		.trim(),
	description: z
		.string()
		.max(500, "La descrizione non può superare i 500 caratteri")
		.optional()
		.or(z.literal("")),
	courseId: z.string().min(1, "Il corso è obbligatorio"),
	classYear: z
		.number()
		.int("L'anno deve essere un numero intero")
		.min(1, "L'anno deve essere maggiore di 0")
		.max(10, "L'anno non può essere maggiore di 10"),
	position: z
		.number()
		.int("La posizione deve essere un numero intero")
		.min(0, "La posizione deve essere maggiore o uguale a 0")
		.optional(),
});

// Section validation schemas
export const sectionSchema = z.object({
	name: z
		.string()
		.min(2, "Il nome deve essere di almeno 2 caratteri")
		.max(100, "Il nome non può superare i 100 caratteri")
		.trim(),
	description: z
		.string()
		.max(500, "La descrizione non può superare i 500 caratteri")
		.optional()
		.or(z.literal("")),
	classId: z.string().min(1, "La classe è obbligatoria"),
	isPublic: z.boolean().default(true),
	position: z
		.number()
		.int("La posizione deve essere un numero intero")
		.min(0, "La posizione deve essere maggiore o uguale a 0")
		.optional(),
});

// Question validation schemas
export const questionSchema = z
	.object({
		content: z
			.string()
			.min(10, "Il contenuto deve essere di almeno 10 caratteri")
			.max(2000, "Il contenuto non può superare i 2000 caratteri")
			.trim(),
		questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"], {
			message: "Il tipo di domanda è obbligatorio. Seleziona un tipo valido",
		}),
		options: z
			.array(z.string().min(1, "L'opzione non può essere vuota"))
			.min(2, "Devono esserci almeno 2 opzioni")
			.max(6, "Non possono esserci più di 6 opzioni")
			.optional(),
		correctAnswer: z
			.array(z.string().min(1, "La risposta corretta non può essere vuota"))
			.min(1, "Deve esserci almeno una risposta corretta")
			.max(6, "Non possono esserci più di 6 risposte corrette"),
		explanation: z
			.string()
			.max(1000, "La spiegazione non può superare i 1000 caratteri")
			.optional()
			.or(z.literal("")),
		difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
			message: "La difficoltà è obbligatoria. Seleziona EASY, MEDIUM o HARD",
		}),
		sectionId: z.string().min(1, "La sezione è obbligatoria"),
	})
	.superRefine((data, ctx) => {
		// Validation for MULTIPLE_CHOICE questions
		if (data.questionType === "MULTIPLE_CHOICE") {
			if (!data.options || data.options.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Le domande a scelta multipla devono avere almeno 2 opzioni",
					path: ["options"],
				});
			}
		}
	});

// Type exports
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;

// Update schemas (all fields optional except ID)
export const updateDepartmentSchema = departmentSchema.partial();
export const updateCourseSchema = courseSchema.partial().omit({ departmentId: true });
export const updateClassSchema = classSchema.partial().omit({ courseId: true });
export const updateSectionSchema = sectionSchema.partial().omit({ classId: true });
export const updateQuestionSchema = questionSchema.partial().omit({ sectionId: true });

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
