import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { departmentSchema } from "../schemas"
import { createDepartment } from "../service/departments"

export const createDepartmentFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(departmentSchema)
  .handler(({ data }) => createDepartment(data))
