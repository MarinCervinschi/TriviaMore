import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { markChangelogsReadSchema } from "../schemas"
import { markVersionsRead } from "../service"

export const markChangelogsReadFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(markChangelogsReadSchema)
  .handler(({ data, context }) =>
    markVersionsRead(context.user.id, data.versions),
  )
