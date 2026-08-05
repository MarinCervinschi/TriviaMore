import { relations } from "drizzle-orm"

import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { departments } from "../catalog/departments"
import { sections } from "../catalog/sections"
import { profiles } from "../public/profiles"
import { contentRequests } from "./content-requests"
import { courseMaintainers } from "./course-maintainers"
import { departmentAdmins } from "./department-admins"
import { legalAcceptances } from "./legal-acceptances"
import { sectionAccess } from "./section-access"

export const departmentAdminsRelations = relations(
  departmentAdmins,
  ({ one }) => ({
    user: one(profiles, {
      fields: [departmentAdmins.userId],
      references: [profiles.id],
    }),
    department: one(departments, {
      fields: [departmentAdmins.departmentId],
      references: [departments.id],
    }),
  }),
)

export const courseMaintainersRelations = relations(
  courseMaintainers,
  ({ one }) => ({
    user: one(profiles, {
      fields: [courseMaintainers.userId],
      references: [profiles.id],
    }),
    course: one(courses, {
      fields: [courseMaintainers.courseId],
      references: [courses.id],
    }),
  }),
)

export const sectionAccessRelations = relations(sectionAccess, ({ one }) => ({
  user: one(profiles, {
    fields: [sectionAccess.userId],
    references: [profiles.id],
  }),
  section: one(sections, {
    fields: [sectionAccess.sectionId],
    references: [sections.id],
  }),
}))

export const contentRequestsRelations = relations(
  contentRequests,
  ({ one }) => ({
    user: one(profiles, {
      fields: [contentRequests.userId],
      references: [profiles.id],
      relationName: "contentRequestAuthor",
    }),
    handler: one(profiles, {
      fields: [contentRequests.handledBy],
      references: [profiles.id],
      relationName: "contentRequestHandler",
    }),
    targetDepartment: one(departments, {
      fields: [contentRequests.targetDepartmentId],
      references: [departments.id],
    }),
    targetCourse: one(courses, {
      fields: [contentRequests.targetCourseId],
      references: [courses.id],
    }),
    targetClass: one(classes, {
      fields: [contentRequests.targetClassId],
      references: [classes.id],
    }),
    targetSection: one(sections, {
      fields: [contentRequests.targetSectionId],
      references: [sections.id],
    }),
  }),
)

export const legalAcceptancesRelations = relations(
  legalAcceptances,
  ({ one }) => ({
    user: one(profiles, {
      fields: [legalAcceptances.userId],
      references: [profiles.id],
    }),
  }),
)
