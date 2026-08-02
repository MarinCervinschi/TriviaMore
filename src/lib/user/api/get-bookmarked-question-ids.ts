import { createServerFn } from "@tanstack/react-start"

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { getBookmarkedQuestionIds } from "../service/bookmarks"

export const getBookmarkedQuestionIdsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, optionalAuthMiddleware])
  .handler(({ context }): Promise<string[]> =>
    context.user
      ? getBookmarkedQuestionIds(context.user.id)
      : Promise.resolve([]),
  )
