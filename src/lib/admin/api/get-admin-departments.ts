import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getAdminDepartments } from "../service/departments"

// The role guard lives in the service: it redirects a MAINTAINER away rather
// than failing, and the catalog scope it resolves is part of the query.
export const getAdminDepartmentsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getAdminDepartments())
