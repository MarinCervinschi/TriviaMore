import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"

import { updateProfileSchema } from "../schemas"
import { updateProfile } from "../service/profile"

export const updateProfileFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(({ data, context }) => updateProfile(context.user.id, data))
