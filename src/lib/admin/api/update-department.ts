import { createServerFn } from "@tanstack/react-start"

import { idSchema, updateDepartmentSchema } from "../schemas"
import { updateDepartment } from "../service/departments"

export const updateDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateDepartmentSchema))
  .handler(({ data: { id, ...updates } }) => updateDepartment(id, updates))
