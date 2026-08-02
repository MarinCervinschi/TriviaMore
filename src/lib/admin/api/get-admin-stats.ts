import { createServerFn } from "@tanstack/react-start"

import { getAdminStats } from "../service/dashboard"

export const getAdminStatsFn = createServerFn({ method: "GET" })
  .handler(() => getAdminStats())
