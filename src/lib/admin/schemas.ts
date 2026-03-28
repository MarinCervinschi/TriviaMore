import { z } from "zod"

// Department
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
      "Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore",
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
})

// Course
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
      "Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore",
    )
    .trim(),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional()
    .or(z.literal("")),
  department_id: z.string().min(1, "Il dipartimento è obbligatorio"),
  course_type: z.enum(["BACHELOR", "MASTER"], {
    message: "Il tipo di corso è obbligatorio. Seleziona Triennale o Magistrale",
  }),
  position: z
    .number()
    .int("La posizione deve essere un numero intero")
    .min(0, "La posizione deve essere maggiore o uguale a 0")
    .optional(),
})

// Class
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
      "Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore",
    )
    .trim(),
  description: z
    .string()
    .max(500, "La descrizione non può superare i 500 caratteri")
    .optional()
    .or(z.literal("")),
  course_id: z.string().min(1, "Il corso è obbligatorio"),
  class_year: z
    .number()
    .int("L'anno deve essere un numero intero")
    .min(1, "L'anno deve essere maggiore di 0")
    .max(10, "L'anno non può essere maggiore di 10"),
  position: z
    .number()
    .int("La posizione deve essere un numero intero")
    .min(0, "La posizione deve essere maggiore o uguale a 0")
    .optional(),
})

// Section
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
  class_id: z.string().min(1, "La classe è obbligatoria"),
  is_public: z.boolean(),
  position: z
    .number()
    .int("La posizione deve essere un numero intero")
    .min(0, "La posizione deve essere maggiore o uguale a 0")
    .optional(),
})

// Question (base object without refinement — needed for .partial())
const questionBaseSchema = z.object({
  content: z
    .string()
    .min(10, "Il contenuto deve essere di almeno 10 caratteri")
    .max(2000, "Il contenuto non può superare i 2000 caratteri")
    .trim(),
  question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"], {
    message:
      "Il tipo di domanda è obbligatorio. Seleziona un tipo valido",
  }),
  options: z
    .array(z.string().min(1, "L'opzione non può essere vuota"))
    .min(2, "Devono esserci almeno 2 opzioni")
    .max(6, "Non possono esserci più di 6 opzioni")
    .optional()
    .nullable(),
  correct_answer: z
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
  section_id: z.string().min(1, "La sezione è obbligatoria"),
})

// Question with refinement (for create forms)
export const questionSchema = questionBaseSchema.superRefine((data, ctx) => {
  if (data.question_type === "MULTIPLE_CHOICE") {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le domande a scelta multipla devono avere almeno 2 opzioni",
        path: ["options"],
      })
    }
  }
})

// Type exports
export type DepartmentInput = z.infer<typeof departmentSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type ClassInput = z.infer<typeof classSchema>
export type SectionInput = z.infer<typeof sectionSchema>
export type QuestionInput = z.infer<typeof questionSchema>

// Update schemas (partial, without parent FK)
export const updateDepartmentSchema = departmentSchema.partial()
export const updateCourseSchema = courseSchema
  .partial()
  .omit({ department_id: true })
export const updateClassSchema = classSchema
  .partial()
  .omit({ course_id: true })
export const updateSectionSchema = sectionSchema
  .partial()
  .omit({ class_id: true })
export const updateQuestionSchema = questionBaseSchema
  .partial()
  .omit({ section_id: true })

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

// ─── Server-side validation schemas ───

export const idSchema = z.object({
  id: z.string().min(1, "ID obbligatorio"),
})

export const userRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["STUDENT", "MAINTAINER", "ADMIN", "SUPERADMIN"], {
    message: "Ruolo non valido",
  }),
})

export const departmentAdminSchema = z.object({
  user_id: z.string().min(1),
  department_id: z.string().min(1),
})

export const courseMaintainerSchema = z.object({
  user_id: z.string().min(1),
  course_id: z.string().min(1),
})

export const sectionAccessSchema = z.object({
  user_id: z.string().min(1),
  section_id: z.string().min(1),
})
