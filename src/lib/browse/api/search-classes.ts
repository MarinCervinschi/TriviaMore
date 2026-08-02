import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { searchClassesSchema } from "../schemas"
import { searchClasses } from "../service/classes"

export const searchClassesFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(searchClassesSchema)
  .handler(({ data }) => searchClasses(data))
