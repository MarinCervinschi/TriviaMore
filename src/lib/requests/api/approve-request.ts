import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requestIdSchema } from "../schemas"
import { approveRequest } from "../service/admin-requests"

export const approveRequestFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(requestIdSchema)
  .handler(({ data }) => approveRequest(data.id))
