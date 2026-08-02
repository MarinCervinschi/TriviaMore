import { createServerFn } from "@tanstack/react-start"

import { acknowledgeRequestSchema } from "../schemas"
import { acknowledgeRequest } from "../service/admin-requests"

export const acknowledgeRequestFn = createServerFn({ method: "POST" })
  .inputValidator(acknowledgeRequestSchema)
  .handler(({ data }) => acknowledgeRequest(data))
