import { createServerFn } from "@tanstack/react-start"

import { courseClassSchema } from "../schemas"
import { addClassToCourse } from "../service/classes"

export const addClassToCourseFn = createServerFn({ method: "POST" })
  .inputValidator(courseClassSchema)
  .handler(({ data }) => addClassToCourse(data))
