import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { getAdminClassDetail } from "../service/classes"

export const getAdminClassDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminClassDetail(data.id))
