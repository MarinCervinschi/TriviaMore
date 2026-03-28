import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import {
  getAdminClassDetailFn,
  getAdminCourseDetailFn,
  getAdminDepartmentDetailFn,
  getAdminDepartmentsFn,
  getAdminPermissionsFn,
  getAdminQuestionDetailFn,
  getAdminSectionDetailFn,
  getAdminStatsFn,
  getAdminUserDetailFn,
  getAdminUserStatsFn,
  getAdminUsersFn,
  getAllCoursesFn,
  getContentTreeFn,
  getPrivateSectionsFn,
  getSectionAccessUsersFn,
} from "./server"

export const adminQueries = {
  contentTree: () =>
    queryOptions({
      queryKey: ["admin", "contentTree"],
      queryFn: () => getContentTreeFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  stats: () =>
    queryOptions({
      queryKey: ["admin", "stats"],
      queryFn: () => getAdminStatsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  permissions: () =>
    queryOptions({
      queryKey: ["admin", "permissions"],
      queryFn: () => getAdminPermissionsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  departments: () =>
    queryOptions({
      queryKey: ["admin", "departments"],
      queryFn: () => getAdminDepartmentsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  department: (id: string) =>
    queryOptions({
      queryKey: ["admin", "department", id],
      queryFn: () => getAdminDepartmentDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  course: (id: string) =>
    queryOptions({
      queryKey: ["admin", "course", id],
      queryFn: () => getAdminCourseDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  class: (id: string) =>
    queryOptions({
      queryKey: ["admin", "class", id],
      queryFn: () => getAdminClassDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  section: (id: string) =>
    queryOptions({
      queryKey: ["admin", "section", id],
      queryFn: () => getAdminSectionDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  question: (id: string) =>
    queryOptions({
      queryKey: ["admin", "question", id],
      queryFn: () => getAdminQuestionDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  users: () =>
    queryOptions({
      queryKey: ["admin", "users"],
      queryFn: () => getAdminUsersFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  user: (id: string) =>
    queryOptions({
      queryKey: ["admin", "user", id],
      queryFn: () => getAdminUserDetailFn({ data: { id } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  userStats: () =>
    queryOptions({
      queryKey: ["admin", "userStats"],
      queryFn: () => getAdminUserStatsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  allCourses: () =>
    queryOptions({
      queryKey: ["admin", "allCourses"],
      queryFn: () => getAllCoursesFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  privateSections: () =>
    queryOptions({
      queryKey: ["admin", "privateSections"],
      queryFn: () => getPrivateSectionsFn(),
      staleTime: STALE_TIME.STANDARD,
    }),

  sectionAccessUsers: (sectionId: string) =>
    queryOptions({
      queryKey: ["admin", "sectionAccessUsers", sectionId],
      queryFn: () => getSectionAccessUsersFn({ data: { section_id: sectionId } }),
      staleTime: STALE_TIME.STANDARD,
    }),
}
