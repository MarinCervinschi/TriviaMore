import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { deleteClass } from "../service/classes"

export const deleteClassFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => deleteClass(data.id))
