import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { sectionSchema } from "../schemas"
import { createSection } from "../service/sections"

export const createSectionFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(sectionSchema)
  .handler(({ data }) => createSection(data))
