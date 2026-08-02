import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { idSchema } from "../schemas"
import { deleteCourse } from "../service/courses"

export const deleteCourseFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(idSchema)
  .handler(({ data }) => deleteCourse(data.id))
