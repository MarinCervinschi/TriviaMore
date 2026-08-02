import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { getAdminCourseDetail } from "../service/courses"

export const getAdminCourseDetailFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => getAdminCourseDetail(data.id))
