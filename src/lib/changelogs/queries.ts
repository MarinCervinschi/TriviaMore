import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import {
  getPublishedChangelogsFn,
  getAdminChangelogsFn,
  getChangelogDetailFn,
} from "./server"

export const changelogQueries = {
  published: () =>
    queryOptions({
      queryKey: ["changelogs", "published"],
      queryFn: () => getPublishedChangelogsFn(),
      staleTime: STALE_TIME.SLOW,
    }),

  adminList: () =>
    queryOptions({
      queryKey: ["admin", "changelogs"],
      queryFn: () => getAdminChangelogsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  adminDetail: (id: string) =>
    queryOptions({
      queryKey: ["admin", "changelog", id],
      queryFn: () => getChangelogDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),
}
