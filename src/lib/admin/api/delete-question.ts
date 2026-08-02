import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { deleteQuestion } from "../service/questions"

export const deleteQuestionFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => deleteQuestion(data.id))
