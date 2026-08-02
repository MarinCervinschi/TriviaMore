import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"

import { getUserBookmarks } from "../service/bookmarks"
import type { UserBookmark } from "../types"

export const getUserBookmarksFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }): Promise<UserBookmark[]> =>
    context.user ? getUserBookmarks(context.user.id) : Promise.resolve([]),
  )
