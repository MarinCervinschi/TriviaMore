import { createServerFn } from "@tanstack/react-start"

import { idSchema } from "../schemas"
import { getAdminClassDetail } from "../service/classes"

export const getAdminClassDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminClassDetail(data.id))
