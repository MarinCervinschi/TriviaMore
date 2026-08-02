import { createServerFn } from "@tanstack/react-start"

import { requireGuest } from "../guards"

export const requireGuestFn = createServerFn({ method: "GET" })
  .handler(() => requireGuest())
