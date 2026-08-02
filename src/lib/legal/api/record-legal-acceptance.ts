import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { acceptLegalSchema } from "../schemas"
import { insertLegalAcceptances } from "../service"

export const recordLegalAcceptanceFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(acceptLegalSchema)
  .handler(async ({ context }) => {
    await insertLegalAcceptances(context.user.id)
    return { success: true }
  })
