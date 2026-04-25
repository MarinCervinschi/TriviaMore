import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import { getUnreadChangelogVersionsFn } from "./server"

export const changelogQueries = {
  unreadVersions: () =>
    queryOptions({
      queryKey: ["changelogs", "unreadVersions"],
      queryFn: () => getUnreadChangelogVersionsFn(),
      staleTime: STALE_TIME.FAST,
      refetchInterval: 1000 * 60,
    }),
}
