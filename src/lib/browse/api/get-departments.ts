import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getDepartments } from "../service/departments"

export const getDepartmentsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getDepartments())
