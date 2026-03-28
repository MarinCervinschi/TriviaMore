import { queryOptions } from "@tanstack/react-query"

import { getNotificationsFn, getUnreadCountFn } from "./server"

export const notificationQueries = {
  all: () =>
    queryOptions({
      queryKey: ["notifications"],
      queryFn: () => getNotificationsFn(),
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: ["notifications", "unreadCount"],
      queryFn: () => getUnreadCountFn(),
      staleTime: 1000 * 30,
      refetchInterval: 1000 * 60,
    }),
}
