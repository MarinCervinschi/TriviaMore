import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { getAdminSectionDetail } from "../service/sections"

export const getAdminSectionDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminSectionDetail(data.id))
