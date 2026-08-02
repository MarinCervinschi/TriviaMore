import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { handleRequestSchema } from "../schemas"
import { handleRequest } from "../service/admin-requests"

export const handleRequestFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(handleRequestSchema)
  .handler(({ data }) => handleRequest(data))
