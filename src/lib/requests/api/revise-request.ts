import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { reviseRequestSchema } from "../schemas"
import { reviseRequest } from "../service/user-requests"

export const reviseRequestFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(reviseRequestSchema)
  .handler(({ data, context }) => reviseRequest(context.user.id, data))
