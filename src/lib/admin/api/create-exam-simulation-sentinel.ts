import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { createExamSimulationSentinel } from "../service/classes"

export const createExamSimulationSentinelFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => createExamSimulationSentinel(data.id))
