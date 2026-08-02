import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema, updateClassSchema } from "../schemas"
import { updateClass } from "../service/classes"

export const updateClassFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema.merge(updateClassSchema))
  .handler(({ data: { id, ...updates } }) => updateClass(id, updates))
