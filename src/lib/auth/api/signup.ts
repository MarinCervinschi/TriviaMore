import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { registerSchema } from "../schemas"
import { signup } from "../service"

export const signupFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(registerSchema)
  .handler(({ data }) => signup(data))
