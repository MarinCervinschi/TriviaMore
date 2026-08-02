import { createServerFn } from "@tanstack/react-start"

import { getAdminRequestCount } from "../service/admin-requests"

export const getAdminRequestCountFn = createServerFn({ method: "GET" })
  .handler(() => getAdminRequestCount())
