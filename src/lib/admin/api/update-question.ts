import { createServerFn } from "@tanstack/react-start"

import { idSchema, updateQuestionSchema } from "../schemas"
import { updateQuestion } from "../service/questions"

export const updateQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateQuestionSchema))
  .handler(({ data: { id, ...updates } }) => updateQuestion(id, updates))
