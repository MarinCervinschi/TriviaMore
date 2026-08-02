import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { courseClassSchema } from "../schemas"
import { removeClassFromCourse } from "../service/classes"

export const removeClassFromCourseFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(courseClassSchema.pick({ course_id: true, class_id: true }))
  .handler(({ data }) => removeClassFromCourse(data))
