import { createServerFn } from "@tanstack/react-start"

import { departmentAdminSchema } from "../schemas"
import { removeDepartmentAdmin } from "../service/users"

export const removeDepartmentAdminFn = createServerFn({ method: "POST" })
  .inputValidator(departmentAdminSchema)
  .handler(({ data }) => removeDepartmentAdmin(data))
