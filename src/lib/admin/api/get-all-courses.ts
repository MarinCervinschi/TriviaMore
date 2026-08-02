import { createServerFn } from "@tanstack/react-start"

import { getAllCourses } from "../service/users"

export const getAllCoursesFn = createServerFn({ method: "GET" })
  .handler(() => getAllCourses())
