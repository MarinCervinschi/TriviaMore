import { createServerFn } from "@tanstack/react-start"

import { idSchema } from "../schemas"
import { getAdminSectionDetail } from "../service/sections"

export const getAdminSectionDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminSectionDetail(data.id))
