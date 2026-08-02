import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { classIdSchema } from "../schemas"
import { removeUserClass } from "../service/classes"

export const removeUserClassFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(classIdSchema)
  .handler(({ data, context }) => removeUserClass(context.user.id, data.classId))
