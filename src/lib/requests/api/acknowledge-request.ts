import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { acknowledgeRequestSchema } from "../schemas"
import { acknowledgeRequest } from "../service/admin-requests"

export const acknowledgeRequestFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(acknowledgeRequestSchema)
  .handler(({ data }) => acknowledgeRequest(data))
