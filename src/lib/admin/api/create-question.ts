import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { questionSchema } from "../schemas"
import { createQuestion } from "../service/questions"

export const createQuestionFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(questionSchema)
  .handler(({ data }) => createQuestion(data))
