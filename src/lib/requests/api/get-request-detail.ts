import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requestIdSchema } from "../schemas"
import { getRequestDetail } from "../service/admin-requests"

export const getRequestDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(requestIdSchema)
  .handler(({ data, context }) => getRequestDetail(context.user.id, data.id))
