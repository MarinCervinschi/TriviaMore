import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getSession } from "../service"

export const getSessionFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getSession())
