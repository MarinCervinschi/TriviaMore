import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { classSchema } from "../schemas"
import { createClass } from "../service/classes"

export const createClassFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(classSchema)
  .handler(({ data }) => createClass(data))
