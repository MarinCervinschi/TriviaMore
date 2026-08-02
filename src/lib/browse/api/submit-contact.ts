import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { contactSchema } from "../contact-schema"
import { submitContact } from "../service/contact"

export const submitContactFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(contactSchema)
  .handler(({ data }) => submitContact(data))
