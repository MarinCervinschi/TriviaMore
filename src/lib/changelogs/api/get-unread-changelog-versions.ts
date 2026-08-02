import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getUnreadVersions } from "../service"

export const getUnreadChangelogVersionsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, authMiddleware])
  .handler(({ context }) => getUnreadVersions(context.user.id))
