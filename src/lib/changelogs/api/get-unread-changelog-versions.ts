import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { getUnreadVersions } from "../service"

export const getUnreadChangelogVersionsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => getUnreadVersions(context.user.id))
