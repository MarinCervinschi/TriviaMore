import { createServerFn } from "@tanstack/react-start"

import { getAdminUsers } from "../service/users"

export const getAdminUsersFn = createServerFn({ method: "GET" })
  .handler(() => getAdminUsers())
