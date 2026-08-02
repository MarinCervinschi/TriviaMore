import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema, updateQuestionSchema } from "../schemas"
import { updateQuestion } from "../service/questions"

export const updateQuestionFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema.merge(updateQuestionSchema))
  .handler(({ data: { id, ...updates } }) => updateQuestion(id, updates))
