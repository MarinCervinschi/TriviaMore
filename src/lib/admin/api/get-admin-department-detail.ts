import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { getAdminDepartmentDetail } from "../service/departments"

export const getAdminDepartmentDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminDepartmentDetail(data.id))
