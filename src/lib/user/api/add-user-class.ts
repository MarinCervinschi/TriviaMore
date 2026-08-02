import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { classRefSchema } from "../schemas"
import { addUserClass } from "../service/classes"

export const addUserClassFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(classRefSchema)
  .handler(({ data, context }) => addUserClass(context.user.id, data))
