import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { questionIdSchema } from "../schemas"
import { toggleBookmark } from "../service/bookmarks"

export const toggleBookmarkFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(questionIdSchema)
  .handler(({ data, context }) =>
    toggleBookmark(context.user.id, data.questionId),
  )
