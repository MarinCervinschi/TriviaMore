import { relations } from "drizzle-orm"

import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { questions } from "../catalog/questions"
import { contentRequests } from "../internal/content-requests"
import { courseMaintainers } from "../internal/course-maintainers"
import { departmentAdmins } from "../internal/department-admins"
import { legalAcceptances } from "../internal/legal-acceptances"
import { sectionAccess } from "../internal/section-access"
import { quizAttempts } from "../quiz/quiz-attempts"
import { bookmarks } from "./bookmarks"
import { notifications } from "./notifications"
import { profiles } from "./profiles"
import { userChangelogReads } from "./user-changelog-reads"
import { userClasses } from "./user-classes"
import { userRecentClasses } from "./user-recent-classes"

export const profilesRelations = relations(profiles, ({ many }) => ({
  departmentAdmins: many(departmentAdmins),
  courseMaintainers: many(courseMaintainers),
  sectionAccess: many(sectionAccess),
  bookmarks: many(bookmarks),
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
