import { createServerFn } from "@tanstack/react-start"

import { idSchema } from "../schemas"
import { createExamSimulationSentinel } from "../service/classes"

export const createExamSimulationSentinelFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(({ data }) => createExamSimulationSentinel(data.id))
