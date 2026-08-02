import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { searchCoursesSchema } from "../schemas"
import { searchCourses } from "../service/courses"

export const searchCoursesFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(searchCoursesSchema)
  .handler(({ data }) => searchCourses(data))
