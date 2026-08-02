import { createServerFn } from "@tanstack/react-start"

import { getDepartments } from "../service/departments"

export const getDepartmentsFn = createServerFn({ method: "GET" })
  .handler(() => getDepartments())
