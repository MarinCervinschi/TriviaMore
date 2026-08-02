import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requireAdmin } from "../guards"

export const requireAdminFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => requireAdmin())
