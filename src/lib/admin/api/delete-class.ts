import { createServerFn } from "@tanstack/react-start"

import { idSchema } from "../schemas"
import { deleteClass } from "../service/classes"

export const deleteClassFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(({ data }) => deleteClass(data.id))
