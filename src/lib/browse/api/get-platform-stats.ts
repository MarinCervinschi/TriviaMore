import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getPlatformStats } from "../service/overview"

export const getPlatformStatsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getPlatformStats())
