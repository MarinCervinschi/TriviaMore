import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { requireLegalAcceptance } from "../guards"

export const requireLegalAcceptanceFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => requireLegalAcceptance())
