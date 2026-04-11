import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import {
  getBrowseOverviewFn,
  getClassWithSectionsFn,
  getCourseWithClassesFn,
  getDepartmentWithCoursesFn,
  getDepartmentsFn,
  getPlatformStatsFn,
  getSectionDetailFn,
  searchClassesFn,
  searchCoursesFn,
} from "./server"
import type { SearchClassesParams, SearchCoursesParams } from "./types"

export const browseQueries = {
  platformStats: () =>
    queryOptions({
      queryKey: ["browse", "platform-stats"],
      queryFn: () => getPlatformStatsFn(),
      staleTime: STALE_TIME.SLOW,
    }),

  browseOverview: () =>
    queryOptions({
      queryKey: ["browse", "overview"],
      queryFn: () => getBrowseOverviewFn(),
      staleTime: STALE_TIME.SLOW,
    }),

  departments: () =>
    queryOptions({
      queryKey: ["browse", "departments"],
      queryFn: () => getDepartmentsFn(),
      staleTime: STALE_TIME.SLOW,
    }),

  department: (code: string) =>
    queryOptions({
      queryKey: ["browse", "department", code],
      queryFn: () => getDepartmentWithCoursesFn({ data: { code } }),
      staleTime: STALE_TIME.SLOW,
    }),

  course: (deptCode: string, courseCode: string) =>
    queryOptions({
      queryKey: ["browse", "course", deptCode, courseCode],
      queryFn: () =>
        getCourseWithClassesFn({ data: { deptCode, courseCode } }),
      staleTime: STALE_TIME.SLOW,
    }),

  class: (deptCode: string, courseCode: string, classCode: string) =>
    queryOptions({
      queryKey: ["browse", "class", deptCode, courseCode, classCode],
      queryFn: () =>
        getClassWithSectionsFn({ data: { deptCode, courseCode, classCode } }),
      staleTime: STALE_TIME.SLOW,
    }),

  searchCourses: (params: SearchCoursesParams) =>
    queryOptions({
      queryKey: ["search", "courses", params],
      queryFn: () => searchCoursesFn({ data: params }),
      staleTime: STALE_TIME.FAST,
      enabled: !!(params.query || params.departmentId || params.courseType || params.campus),
    }),

  searchClasses: (params: SearchClassesParams) =>
    queryOptions({
      queryKey: ["search", "classes", params],
      queryFn: () => searchClassesFn({ data: params }),
      staleTime: STALE_TIME.FAST,
      enabled: !!(params.query || params.departmentId || params.courseId || params.classYear !== undefined),
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
      staleTime: STALE_TIME.SLOW,
    }),
}
