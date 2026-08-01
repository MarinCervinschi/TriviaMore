import { relations } from "drizzle-orm"

import { courseMaintainers } from "../catalog/course-maintainers"
import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { departmentAdmins } from "../catalog/department-admins"
import { departments } from "../catalog/departments"
import { questions } from "../catalog/questions"
import { sectionAccess } from "../catalog/section-access"
import { sections } from "../catalog/sections"
import { quizAttempts } from "../quiz/quiz-attempts"
import { bookmarks } from "./bookmarks"
import { contentRequests } from "./content-requests"
import { legalAcceptances } from "./legal-acceptances"
import { notifications } from "./notifications"
import { profiles } from "./profiles"
import { progress } from "./progress"
import { userChangelogReads } from "./user-changelog-reads"
import { userClasses } from "./user-classes"
import { userRecentClasses } from "./user-recent-classes"

export const profilesRelations = relations(profiles, ({ many }) => ({
  departmentAdmins: many(departmentAdmins),
  courseMaintainers: many(courseMaintainers),
  sectionAccess: many(sectionAccess),
  bookmarks: many(bookmarks),
  progress: many(progress),
  classes: many(userClasses),
  recentClasses: many(userRecentClasses),
  changelogReads: many(userChangelogReads),
  notifications: many(notifications),
  legalAcceptances: many(legalAcceptances),
  quizAttempts: many(quizAttempts),
  contentRequests: many(contentRequests, {
    relationName: "contentRequestAuthor",
  }),
  handledContentRequests: many(contentRequests, {
    relationName: "contentRequestHandler",
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.id],
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

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(profiles, {
    fields: [bookmarks.userId],
    references: [profiles.id],
  }),
  question: one(questions, {
    fields: [bookmarks.questionId],
    references: [questions.id],
  }),
}))

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(profiles, {
    fields: [progress.userId],
    references: [profiles.id],
  }),
  section: one(sections, {
    fields: [progress.sectionId],
    references: [sections.id],
  }),
}))

export const userClassesRelations = relations(userClasses, ({ one }) => ({
  user: one(profiles, {
    fields: [userClasses.userId],
    references: [profiles.id],
  }),
  class: one(classes, {
    fields: [userClasses.classId],
    references: [classes.id],
  }),
  course: one(courses, {
    fields: [userClasses.courseId],
    references: [courses.id],
  }),
}))

export const userRecentClassesRelations = relations(
  userRecentClasses,
  ({ one }) => ({
    user: one(profiles, {
      fields: [userRecentClasses.userId],
      references: [profiles.id],
    }),
    class: one(classes, {
      fields: [userRecentClasses.classId],
      references: [classes.id],
    }),
    course: one(courses, {
      fields: [userRecentClasses.courseId],
      references: [courses.id],
    }),
  }),
)

export const userChangelogReadsRelations = relations(
  userChangelogReads,
  ({ one }) => ({
    user: one(profiles, {
      fields: [userChangelogReads.userId],
      references: [profiles.id],
    }),
  }),
)
