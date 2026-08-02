import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getAdminRequestCount } from "../service/admin-requests"

export const getAdminRequestCountFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getAdminRequestCount())
