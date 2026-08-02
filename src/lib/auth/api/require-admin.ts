import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "../guards"

export const requireAdminFn = createServerFn({ method: "GET" })
  .handler(() => requireAdmin())
