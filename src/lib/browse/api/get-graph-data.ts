import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getGraphData } from "../service/graph"

export const getGraphDataFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(() => getGraphData())
