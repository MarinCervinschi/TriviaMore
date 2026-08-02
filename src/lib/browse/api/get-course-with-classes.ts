import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { courseCodesSchema } from "../schemas"
import { getCourseWithClasses } from "../service/courses"

export const getCourseWithClassesFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(courseCodesSchema)
  .handler(({ data }) => getCourseWithClasses(data.deptCode, data.courseCode))
