import { createServerFn } from "@tanstack/react-start"

import { getBrowseOverview } from "../service/overview"

export const getBrowseOverviewFn = createServerFn({ method: "GET" })
  .handler(() => getBrowseOverview())
