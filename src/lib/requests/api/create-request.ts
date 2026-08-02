import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { createRequestSchema } from "../schemas"
import { createRequest } from "../service/user-requests"

export const createRequestFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createRequestSchema)
  .handler(({ data, context }) => createRequest(context.user.id, data))
