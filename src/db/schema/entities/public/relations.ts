import { relations } from "drizzle-orm"

import { classes } from "../catalog/classes"
import { courses } from "../catalog/courses"
import { questions } from "../catalog/questions"
import { sections } from "../catalog/sections"
import { contentRequests } from "../internal/content-requests"
import { courseMaintainers } from "../internal/course-maintainers"
import { departmentAdmins } from "../internal/department-admins"
import { legalAcceptances } from "../internal/legal-acceptances"
import { sectionAccess } from "../internal/section-access"
import { quizAttempts } from "../quiz/quiz-attempts"
import { achievements } from "./achievements"
import { bookmarks } from "./bookmarks"
import { notifications } from "./notifications"
import { profiles } from "./profiles"
import { userChangelogReads } from "./user-changelog-reads"
import { userAchievements } from "./user-achievements"
import { userClasses } from "./user-classes"
import { userDayActivity } from "./user-day-activity"
import { userQuestionStats } from "./user-question-stats"
import { userSectionStats } from "./user-section-stats"
import { userStats } from "./user-stats"
import { userRecentClasses } from "./user-recent-classes"

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  departmentAdmins: many(departmentAdmins),
  courseMaintainers: many(courseMaintainers),
  sectionAccess: many(sectionAccess),
  bookmarks: many(bookmarks),
  classes: many(userClasses),
  recentClasses: many(userRecentClasses),
  changelogReads: many(userChangelogReads),
  notifications: many(notifications),
  achievements: many(userAchievements),
  stats: one(userStats),
  sectionStats: many(userSectionStats),
  questionStats: many(userQuestionStats),
  dayActivity: many(userDayActivity),
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

export const achievementsRelations = relations(achievements, ({ many }) => ({
  awards: many(userAchievements),
}))

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(profiles, {
    fields: [userAchievements.userId],
    references: [profiles.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementKey],
    references: [achievements.key],
  }),
}))

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(profiles, { fields: [userStats.userId], references: [profiles.id] }),
}))

export const userSectionStatsRelations = relations(userSectionStats, ({ one }) => ({
  user: one(profiles, { fields: [userSectionStats.userId], references: [profiles.id] }),
  section: one(sections, {
    fields: [userSectionStats.sectionId],
    references: [sections.id],
  }),
}))

export const userQuestionStatsRelations = relations(userQuestionStats, ({ one }) => ({
  user: one(profiles, { fields: [userQuestionStats.userId], references: [profiles.id] }),
  question: one(questions, {
    fields: [userQuestionStats.questionId],
    references: [questions.id],
  }),
}))

export const userDayActivityRelations = relations(userDayActivity, ({ one }) => ({
  user: one(profiles, { fields: [userDayActivity.userId], references: [profiles.id] }),
}))
