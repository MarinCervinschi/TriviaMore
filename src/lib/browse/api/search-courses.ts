import { createServerFn } from "@tanstack/react-start"

import { searchCoursesSchema } from "../schemas"
import { searchCourses } from "../service/courses"

export const searchCoursesFn = createServerFn({ method: "GET" })
  .inputValidator(searchCoursesSchema)
  .handler(({ data }) => searchCourses(data))
