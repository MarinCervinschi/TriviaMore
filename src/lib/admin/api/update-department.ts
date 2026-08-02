import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema, updateDepartmentSchema } from "../schemas"
import { updateDepartment } from "../service/departments"

export const updateDepartmentFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema.merge(updateDepartmentSchema))
  .handler(({ data: { id, ...updates } }) => updateDepartment(id, updates))
