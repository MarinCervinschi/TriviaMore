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
} from "./server"

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
