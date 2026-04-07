import { z } from "zod"

import { questionFieldsSchema, questionMcRefinement } from "@/lib/shared/question-schema"

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
  area: z
    .enum(["SCIENZE", "TECNOLOGIA", "SALUTE", "VITA", "SOCIETA_CULTURA"])
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
  course_type: z.enum(["BACHELOR", "MASTER", "SINGLE_CYCLE"], {
    message: "Il tipo di corso è obbligatorio",
  }),
  location: z
    .string()
    .max(200, "La sede non può superare i 200 caratteri")
    .optional()
    .or(z.literal("")),
  cfu: z
    .number()
    .int()
    .min(1, "I CFU devono essere almeno 1")
    .max(360, "I CFU non possono superare 360")
    .optional(),
  position: z
    .number()
    .int("La posizione deve essere un numero intero")
    .min(0, "La posizione deve essere maggiore o uguale a 0")
    .optional(),
})

// Class (universal container — course-specific fields are in courseClassSchema)
export const classSchema = z.object({
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
  cfu: z
    .number()
    .int()
    .min(1, "I CFU devono essere almeno 1")
    .max(30, "I CFU non possono superare 30")
    .optional(),
  position: z
    .number()
    .int("La posizione deve essere un numero intero")
    .min(0, "La posizione deve essere maggiore o uguale a 0")
    .optional(),
})

// Course-class junction (per-course metadata for a class)
export const courseClassSchema = z.object({
  course_id: z.string().min(1, "Il corso è obbligatorio"),
  class_id: z.string().min(1, "La classe è obbligatoria"),
  code: z
    .string()
    .min(2, "Il codice deve essere di almeno 2 caratteri")
    .max(15, "Il codice non può superare i 15 caratteri")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore",
    )
    .trim(),
  class_year: z
    .number()
    .int("L'anno deve essere un numero intero")
    .min(1, "L'anno deve essere maggiore di 0")
    .max(10, "L'anno non può essere maggiore di 10"),
  mandatory: z.boolean().default(false),
  catalogue_url: z
    .string()
    .url("L'URL del catalogo non è valido")
    .optional()
    .or(z.literal("")),
  curriculum: z
    .string()
    .max(500, "Il curriculum non può superare i 500 caratteri")
    .optional()
    .or(z.literal("")),
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

// Question (extends shared fields with section_id)
const questionBaseSchema = questionFieldsSchema.extend({
  section_id: z.string().min(1, "La sezione è obbligatoria"),
})

// Question with refinement (for create forms)
export const questionSchema = questionBaseSchema.superRefine(questionMcRefinement)

// Type exports
export type DepartmentInput = z.infer<typeof departmentSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type ClassInput = z.infer<typeof classSchema>
export type CourseClassInput = z.infer<typeof courseClassSchema>
export type SectionInput = z.infer<typeof sectionSchema>
export type QuestionInput = z.infer<typeof questionSchema>

// Update schemas (partial, without parent FK)
export const updateDepartmentSchema = departmentSchema.partial()
export const updateCourseSchema = courseSchema
  .partial()
  .omit({ department_id: true })
export const updateClassSchema = classSchema.partial()
export const updateCourseClassSchema = courseClassSchema
  .partial()
  .omit({ course_id: true, class_id: true })
export const updateSectionSchema = sectionSchema
  .partial()
  .omit({ class_id: true })
export const updateQuestionSchema = questionBaseSchema
  .partial()
  .omit({ section_id: true })

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
export type UpdateCourseClassInput = z.infer<typeof updateCourseClassSchema>
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
