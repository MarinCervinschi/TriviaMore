import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { courseSchema } from "../schemas"
import { createCourse } from "../service/courses"

export const createCourseFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(courseSchema)
  .handler(({ data }) => createCourse(data))
