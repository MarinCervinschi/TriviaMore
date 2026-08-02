import { createServerFn } from "@tanstack/react-start"

import { courseCodesSchema } from "../schemas"
import { getCourseWithClasses } from "../service/courses"

export const getCourseWithClassesFn = createServerFn({ method: "GET" })
  .inputValidator(courseCodesSchema)
  .handler(({ data }) => getCourseWithClasses(data.deptCode, data.courseCode))
