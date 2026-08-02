import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { questionSchema } from "../schemas"
import { createQuestionsBulk } from "../service/questions"

export const createQuestionsBulkFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(z.array(questionSchema))
  .handler(({ data }) => createQuestionsBulk(data))
