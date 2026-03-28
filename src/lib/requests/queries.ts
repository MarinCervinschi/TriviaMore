import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import {
  getAdminRequestCountFn,
  getAdminRequestsFn,
  getContentTreeForRequestsFn,
  getRequestDetailFn,
  getUserRequestsFn,
} from "./server"

export const requestQueries = {
  userRequests: () =>
    queryOptions({
      queryKey: ["requests", "mine"],
      queryFn: () => getUserRequestsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  requestDetail: (id: string) =>
    queryOptions({
      queryKey: ["requests", "detail", id],
      queryFn: () => getRequestDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  contentTree: () =>
    queryOptions({
      queryKey: ["requests", "contentTree"],
      queryFn: () => getContentTreeForRequestsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  adminRequests: () =>
    queryOptions({
      queryKey: ["admin", "requests"],
      queryFn: () => getAdminRequestsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  adminRequestCount: () =>
    queryOptions({
      queryKey: ["admin", "requestCount"],
      queryFn: () => getAdminRequestCountFn(),
      staleTime: STALE_TIME.FAST,
    }),
}
