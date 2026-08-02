import { createServerFn } from "@tanstack/react-start"

import { departmentIdSchema } from "../schemas"
import { getDepartmentCourseList } from "../service/departments"

export const getDepartmentCourseListFn = createServerFn({ method: "GET" })
  .inputValidator(departmentIdSchema)
  .handler(({ data }) => getDepartmentCourseList(data.departmentId))
