import { createServerFn } from "@tanstack/react-start"

import { classSchema } from "../schemas"
import { createClass } from "../service/classes"

export const createClassFn = createServerFn({ method: "POST" })
  .inputValidator(classSchema)
  .handler(({ data }) => createClass(data))
