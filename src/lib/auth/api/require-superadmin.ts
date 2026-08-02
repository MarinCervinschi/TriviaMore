import { createServerFn } from "@tanstack/react-start"

import { requireSuperadmin } from "../guards"

export const requireSuperadminFn = createServerFn({ method: "GET" })
  .handler(() => requireSuperadmin())
