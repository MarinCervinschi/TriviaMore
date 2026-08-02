import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { departmentCodeSchema } from "../schemas"
import { getDepartmentWithCourses } from "../service/departments"

export const getDepartmentWithCoursesFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(departmentCodeSchema)
  .handler(({ data }) => getDepartmentWithCourses(data.code))
