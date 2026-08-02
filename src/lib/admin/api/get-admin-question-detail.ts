import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { getAdminQuestionDetail } from "../service/questions"

export const getAdminQuestionDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminQuestionDetail(data.id))
