import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { sectionCodesSchema } from "../schemas"
import { getSectionDetail } from "../service/sections"

export const getSectionDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .inputValidator(sectionCodesSchema)
  .handler(({ data, context }) =>
    getSectionDetail(context.user?.id ?? null, data),
  )
