import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getBrowseOverview } from "../service/overview"

export const getBrowseOverviewFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getBrowseOverview())
