import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { updateReportSchema } from "../schemas"
import { updateReport } from "../service/user-requests"

export const updateReportFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(updateReportSchema)
  .handler(({ data, context }) => updateReport(context.user.id, data))
