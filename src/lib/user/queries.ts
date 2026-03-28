import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import {
  getRecentClassesFn,
  getUserBookmarksFn,
  getUserClassesFn,
  getUserProfileFn,
  getUserProgressFn,
  isClassSavedFn,
} from "./server"

export const userQueries = {
  profile: () =>
    queryOptions({
      queryKey: ["user", "profile"],
      queryFn: () => getUserProfileFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  classes: () =>
    queryOptions({
      queryKey: ["user", "classes"],
      queryFn: () => getUserClassesFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  bookmarks: () =>
    queryOptions({
      queryKey: ["user", "bookmarks"],
      queryFn: () => getUserBookmarksFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  progress: () =>
    queryOptions({
      queryKey: ["user", "progress"],
      queryFn: () => getUserProgressFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  recentClasses: () =>
    queryOptions({
      queryKey: ["user", "recent-classes"],
      queryFn: () => getRecentClassesFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  isClassSaved: (classId: string) =>
    queryOptions({
      queryKey: ["user", "class-saved", classId],
      queryFn: () => isClassSavedFn({ data: { classId } }),
      staleTime: STALE_TIME.STANDARD,
    }),
}
