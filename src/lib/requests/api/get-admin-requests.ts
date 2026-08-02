import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getAdminRequests } from "../service/admin-requests"

// The admin guard lives in the service: it also computes the maintainer scope
// the query needs.
export const getAdminRequestsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getAdminRequests())
