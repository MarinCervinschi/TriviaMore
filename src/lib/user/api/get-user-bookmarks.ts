import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getUserBookmarks } from "../service/bookmarks"
import type { UserBookmark } from "../types"

export const getUserBookmarksFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .handler(({ context }): Promise<UserBookmark[]> =>
    context.user ? getUserBookmarks(context.user.id) : Promise.resolve([]),
  )
