import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"

import { getAcceptanceStatus } from "../service"

export const getAcceptanceStatusFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }) => getAcceptanceStatus(context.user?.id ?? null))
