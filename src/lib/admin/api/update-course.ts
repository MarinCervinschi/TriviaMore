import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema, updateCourseSchema } from "../schemas"
import { updateCourse } from "../service/courses"

export const updateCourseFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema.merge(updateCourseSchema))
  .handler(({ data: { id, ...updates } }) => updateCourse(id, updates))
