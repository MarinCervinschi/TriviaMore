import { createServerFn } from "@tanstack/react-start"

import { contactSchema } from "../contact-schema"
import { submitContact } from "../service/contact"

export const submitContactFn = createServerFn({ method: "POST" })
  .inputValidator(contactSchema)
  .handler(({ data }) => submitContact(data))
