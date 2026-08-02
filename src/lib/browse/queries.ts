import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import {
  getAvailableClassYearsFn,
  getBrowseOverviewFn,
  getClassWithSectionsFn,
  getCourseWithClassesFn,
  getDepartmentCourseListFn,
  getDepartmentWithCoursesFn,
  getDepartmentsFn,
  getGraphDataFn,
  getPlatformStatsFn,
  getSectionDetailFn,
  searchClassesFn,
  searchCoursesFn,
} from "./api"
import type { SearchClassesParams, SearchCoursesParams } from "./types"

function hasCoursesFilter(p: SearchCoursesParams): boolean {
  return !!(p.query || p.departmentId || p.courseType || p.campus)
}

function hasClassesFilter(p: SearchClassesParams): boolean {
  return !!(
    p.query ||
    p.departmentId ||
    p.courseId ||
    p.classYear !== undefined ||
    p.mandatory !== undefined
  )
}

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

  graph: () =>
    queryOptions({
      queryKey: ["browse", "graph"],
      queryFn: () => getGraphDataFn(),
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
      enabled: hasCoursesFilter(params),
      placeholderData: keepPreviousData,
    }),

  searchClasses: (params: SearchClassesParams) =>
    queryOptions({
      queryKey: ["search", "classes", params],
      queryFn: () => searchClassesFn({ data: params }),
      staleTime: STALE_TIME.FAST,
      enabled: hasClassesFilter(params),
      placeholderData: keepPreviousData,
    }),

  departmentCourseList: (departmentId: string | undefined) =>
    queryOptions({
      queryKey: ["browse", "department-course-list", departmentId],
      queryFn: () =>
        getDepartmentCourseListFn({ data: { departmentId: departmentId! } }),
      staleTime: STALE_TIME.SLOW,
      enabled: !!departmentId,
      placeholderData: keepPreviousData,
    }),

  availableClassYears: (departmentId?: string, courseId?: string) =>
    queryOptions({
      queryKey: ["browse", "available-class-years", departmentId, courseId],
      queryFn: () =>
        getAvailableClassYearsFn({ data: { departmentId, courseId } }),
      staleTime: STALE_TIME.SLOW,
      placeholderData: keepPreviousData,
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
