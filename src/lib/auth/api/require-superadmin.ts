import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requireSuperadmin } from "../guards"

export const requireSuperadminFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => requireSuperadmin())
