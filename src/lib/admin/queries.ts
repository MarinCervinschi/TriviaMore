import { queryOptions } from "@tanstack/react-query"

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
      staleTime: 1000 * 60 * 2,
    }),

  stats: () =>
    queryOptions({
      queryKey: ["admin", "stats"],
      queryFn: () => getAdminStatsFn(),
    }),

  permissions: () =>
    queryOptions({
      queryKey: ["admin", "permissions"],
      queryFn: () => getAdminPermissionsFn(),
      staleTime: 1000 * 60 * 5,
    }),

  departments: () =>
    queryOptions({
      queryKey: ["admin", "departments"],
      queryFn: () => getAdminDepartmentsFn(),
    }),

  department: (id: string) =>
    queryOptions({
      queryKey: ["admin", "department", id],
      queryFn: () => getAdminDepartmentDetailFn({ data: { id } }),
    }),

  course: (id: string) =>
    queryOptions({
      queryKey: ["admin", "course", id],
      queryFn: () => getAdminCourseDetailFn({ data: { id } }),
    }),

  class: (id: string) =>
    queryOptions({
      queryKey: ["admin", "class", id],
      queryFn: () => getAdminClassDetailFn({ data: { id } }),
    }),

  section: (id: string) =>
    queryOptions({
      queryKey: ["admin", "section", id],
      queryFn: () => getAdminSectionDetailFn({ data: { id } }),
    }),

  question: (id: string) =>
    queryOptions({
      queryKey: ["admin", "question", id],
      queryFn: () => getAdminQuestionDetailFn({ data: { id } }),
    }),

  users: () =>
    queryOptions({
      queryKey: ["admin", "users"],
      queryFn: () => getAdminUsersFn(),
    }),

  user: (id: string) =>
    queryOptions({
      queryKey: ["admin", "user", id],
      queryFn: () => getAdminUserDetailFn({ data: { id } }),
    }),

  userStats: () =>
    queryOptions({
      queryKey: ["admin", "userStats"],
      queryFn: () => getAdminUserStatsFn(),
    }),

  allCourses: () =>
    queryOptions({
      queryKey: ["admin", "allCourses"],
      queryFn: () => getAllCoursesFn(),
    }),

  privateSections: () =>
    queryOptions({
      queryKey: ["admin", "privateSections"],
      queryFn: () => getPrivateSectionsFn(),
    }),

  sectionAccessUsers: (sectionId: string) =>
    queryOptions({
      queryKey: ["admin", "sectionAccessUsers", sectionId],
      queryFn: () => getSectionAccessUsersFn({ data: { section_id: sectionId } }),
    }),
}
