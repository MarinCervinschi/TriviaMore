import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { departmentIdSchema } from "../schemas"
import { getDepartmentCourseList } from "../service/departments"

export const getDepartmentCourseListFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(departmentIdSchema)
  .handler(({ data }) => getDepartmentCourseList(data.departmentId))
