import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { classIdSchema } from "../schemas"
import { isClassSaved } from "../service/classes"

export const isClassSavedFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .inputValidator(classIdSchema)
  .handler(({ data, context }) =>
    isClassSaved(context.user?.id ?? null, data.classId),
  )
