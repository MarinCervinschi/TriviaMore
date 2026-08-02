import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { courseClassSchema, updateCourseClassSchema } from "../schemas"
import { updateCourseClass } from "../service/classes"

export const updateCourseClassFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(
    courseClassSchema
      .pick({ course_id: true, class_id: true })
      .merge(updateCourseClassSchema),
  )
  .handler(({ data: { course_id, class_id, ...updates } }) =>
    updateCourseClass({ course_id, class_id }, updates),
  )
