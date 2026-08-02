import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { classRefSchema } from "../schemas"
import { addUserClass } from "../service/classes"

export const addUserClassFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(classRefSchema)
  .handler(({ data, context }) => addUserClass(context.user.id, data))
