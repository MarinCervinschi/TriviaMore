import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { loginSchema } from "../schemas"
import { login } from "../service"

export const loginFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(loginSchema)
  .handler(({ data }) => login(data))
