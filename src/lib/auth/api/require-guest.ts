import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requireGuest } from "../guards"

export const requireGuestFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => requireGuest())
