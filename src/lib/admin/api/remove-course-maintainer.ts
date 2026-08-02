import { createServerFn } from "@tanstack/react-start"

import { courseMaintainerSchema } from "../schemas"
import { removeCourseMaintainer } from "../service/users"

export const removeCourseMaintainerFn = createServerFn({ method: "POST" })
  .inputValidator(courseMaintainerSchema)
  .handler(({ data }) => removeCourseMaintainer(data))
