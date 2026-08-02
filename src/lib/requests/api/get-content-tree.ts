import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getContentTree } from "../service/content-tree"

export const getContentTreeForRequestsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, authMiddleware])
  .handler(({ context }) => getContentTree(context.user.id))
