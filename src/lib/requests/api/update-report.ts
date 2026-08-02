import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { updateReportSchema } from "../schemas"
import { updateReport } from "../service/user-requests"

export const updateReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateReportSchema)
  .handler(({ data, context }) => updateReport(context.user.id, data))
