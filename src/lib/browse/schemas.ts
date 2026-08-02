import { z } from "zod"

export const departmentCodeSchema = z.object({ code: z.string().min(1) })

export const courseCodesSchema = z.object({
  deptCode: z.string().min(1),
  courseCode: z.string().min(1),
})

export const classCodesSchema = courseCodesSchema.extend({
  classCode: z.string().min(1),
})

export const sectionCodesSchema = classCodesSchema.extend({
  sectionSlug: z.string().min(1),
})

export const departmentIdSchema = z.object({ departmentId: z.string().uuid() })

export const classYearsSchema = z.object({
  departmentId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
})

const paginationSchema = {
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
}

export const searchCoursesSchema = z.object({
  query: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  courseType: z.string().optional(),
  campus: z.string().optional(),
  ...paginationSchema,
})

export const searchClassesSchema = z.object({
  query: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  classYear: z.number().int().optional(),
  mandatory: z.boolean().optional(),
  ...paginationSchema,
})
