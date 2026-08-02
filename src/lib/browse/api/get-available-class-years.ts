import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { classYearsSchema } from "../schemas"
import { getAvailableClassYears } from "../service/classes"

export const getAvailableClassYearsFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(classYearsSchema)
  .handler(({ data }) => getAvailableClassYears(data))
