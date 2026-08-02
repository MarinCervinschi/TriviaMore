import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema, updateSectionSchema } from "../schemas"
import { updateSection } from "../service/sections"

export const updateSectionFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema.merge(updateSectionSchema))
  .handler(({ data: { id, ...updates } }) => updateSection(id, updates))
