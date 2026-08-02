import { createServerFn } from "@tanstack/react-start"

import { sectionAccessSchema } from "../schemas"
import { removeSectionAccess } from "../service/users"

export const removeSectionAccessFn = createServerFn({ method: "POST" })
  .inputValidator(sectionAccessSchema)
  .handler(({ data }) => removeSectionAccess(data))
