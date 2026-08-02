import { createServerFn } from "@tanstack/react-start"

import { getSession } from "../service"

export const getSessionFn = createServerFn({ method: "GET" })
  .handler(() => getSession())
