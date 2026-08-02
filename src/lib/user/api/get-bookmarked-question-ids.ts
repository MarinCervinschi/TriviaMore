import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"

import { getBookmarkedQuestionIds } from "../service/bookmarks"

export const getBookmarkedQuestionIdsFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }): Promise<string[]> =>
    context.user
      ? getBookmarkedQuestionIds(context.user.id)
      : Promise.resolve([]),
  )
