import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { createRequestSchema } from "../schemas"
import { createRequest } from "../service/user-requests"

export const createRequestFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(createRequestSchema)
  .handler(({ data, context }) => createRequest(context.user.id, data))
