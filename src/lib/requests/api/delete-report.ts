import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requestIdSchema } from "../schemas"
import { deleteReport } from "../service/user-requests"

export const deleteReportFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(requestIdSchema)
  .handler(({ data, context }) => deleteReport(context.user.id, data.id))
