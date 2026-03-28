import { queryOptions } from "@tanstack/react-query"

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
    }),

  requestDetail: (id: string) =>
    queryOptions({
      queryKey: ["requests", "detail", id],
      queryFn: () => getRequestDetailFn({ data: { id } }),
    }),

  contentTree: () =>
    queryOptions({
      queryKey: ["requests", "contentTree"],
      queryFn: () => getContentTreeForRequestsFn(),
      staleTime: 1000 * 60 * 5,
    }),

  adminRequests: () =>
    queryOptions({
      queryKey: ["admin", "requests"],
      queryFn: () => getAdminRequestsFn(),
    }),

  adminRequestCount: () =>
    queryOptions({
      queryKey: ["admin", "requestCount"],
      queryFn: () => getAdminRequestCountFn(),
      staleTime: 1000 * 30,
    }),
}
