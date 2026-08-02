import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { deleteSection } from "../service/sections"

export const deleteSectionFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => deleteSection(data.id))
