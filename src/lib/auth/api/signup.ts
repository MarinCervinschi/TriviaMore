import { createServerFn } from "@tanstack/react-start"

import { registerSchema } from "../schemas"
import { signup } from "../service"

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(({ data }) => signup(data))
