import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { classCodesSchema } from "../schemas"
import { getClassWithSections } from "../service/classes"

export const getClassWithSectionsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .inputValidator(classCodesSchema)
  .handler(({ data, context }) =>
    getClassWithSections(context.user?.id ?? null, data),
  )
