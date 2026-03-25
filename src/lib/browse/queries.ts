import { queryOptions } from "@tanstack/react-query"

import {
  getClassWithSectionsFn,
  getCourseWithClassesFn,
  getDepartmentWithCoursesFn,
  getDepartmentsFn,
  getSectionDetailFn,
} from "./server"

export const browseQueries = {
  departments: () =>
    queryOptions({
      queryKey: ["browse", "departments"],
      queryFn: () => getDepartmentsFn(),
    }),

  department: (code: string) =>
    queryOptions({
      queryKey: ["browse", "department", code],
      queryFn: () => getDepartmentWithCoursesFn({ data: { code } }),
    }),

  course: (deptCode: string, courseCode: string) =>
    queryOptions({
      queryKey: ["browse", "course", deptCode, courseCode],
      queryFn: () =>
        getCourseWithClassesFn({ data: { deptCode, courseCode } }),
    }),

  class: (deptCode: string, courseCode: string, classCode: string) =>
    queryOptions({
      queryKey: ["browse", "class", deptCode, courseCode, classCode],
      queryFn: () =>
        getClassWithSectionsFn({ data: { deptCode, courseCode, classCode } }),
    }),

  section: (
    deptCode: string,
    courseCode: string,
    classCode: string,
    sectionSlug: string,
  ) =>
    queryOptions({
      queryKey: [
        "browse",
        "section",
        deptCode,
        courseCode,
        classCode,
        sectionSlug,
      ],
      queryFn: () =>
        getSectionDetailFn({
          data: { deptCode, courseCode, classCode, sectionSlug },
        }),
    }),
}
