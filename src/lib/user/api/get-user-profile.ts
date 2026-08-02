import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"

import { getUserProfile } from "../service/profile"

export const getUserProfileFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }) => getUserProfile(context.user?.id ?? null))
