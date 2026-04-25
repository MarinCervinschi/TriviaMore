import { queryOptions } from "@tanstack/react-query"

import { getAcceptanceStatusFn } from "./server"

export const legalQueries = {
  acceptanceStatus: () =>
    queryOptions({
      queryKey: ["legal", "acceptance-status"],
      queryFn: () => getAcceptanceStatusFn(),
    }),
}
