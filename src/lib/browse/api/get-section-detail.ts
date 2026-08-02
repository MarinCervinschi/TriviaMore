import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"

import { sectionCodesSchema } from "../schemas"
import { getSectionDetail } from "../service/sections"

export const getSectionDetailFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(sectionCodesSchema)
  .handler(({ data, context }) =>
    getSectionDetail(context.user?.id ?? null, data),
  )
