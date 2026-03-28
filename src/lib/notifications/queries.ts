import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import { getNotificationsFn, getUnreadCountFn } from "./server"

export const notificationQueries = {
  all: () =>
    queryOptions({
      queryKey: ["notifications"],
      queryFn: () => getNotificationsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: ["notifications", "unreadCount"],
      queryFn: () => getUnreadCountFn(),
      staleTime: STALE_TIME.FAST,
      refetchInterval: 1000 * 60,
    }),
}
