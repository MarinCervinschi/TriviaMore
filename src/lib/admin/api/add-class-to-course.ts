import { createServerFn } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

import { courseClassSchema } from "../schemas"
import { addClassToCourse } from "../service/classes"

export const addClassToCourseFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware])
  .inputValidator(courseClassSchema)
  .handler(({ data }) => addClassToCourse(data))
