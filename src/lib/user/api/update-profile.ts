import { createServerFn } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { updateProfileSchema } from "../schemas"
import { updateProfile } from "../service/profile"

export const updateProfileFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(({ data, context }) => updateProfile(context.user.id, data))
