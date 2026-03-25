import { queryOptions } from "@tanstack/react-query"

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
    }),

  classes: () =>
    queryOptions({
      queryKey: ["user", "classes"],
      queryFn: () => getUserClassesFn(),
    }),

  bookmarks: () =>
    queryOptions({
      queryKey: ["user", "bookmarks"],
      queryFn: () => getUserBookmarksFn(),
    }),

  progress: () =>
    queryOptions({
      queryKey: ["user", "progress"],
      queryFn: () => getUserProgressFn(),
    }),

  recentClasses: () =>
    queryOptions({
      queryKey: ["user", "recent-classes"],
      queryFn: () => getRecentClassesFn(),
    }),

  isClassSaved: (classId: string) =>
    queryOptions({
      queryKey: ["user", "class-saved", classId],
      queryFn: () => isClassSavedFn({ data: { classId } }),
    }),
}
