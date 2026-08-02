import { createServerFn } from "@tanstack/react-start"

import { getPlatformStats } from "../service/overview"

export const getPlatformStatsFn = createServerFn({ method: "GET" })
  .handler(() => getPlatformStats())
