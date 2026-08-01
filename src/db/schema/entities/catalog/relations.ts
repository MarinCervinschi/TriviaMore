import { relations } from "drizzle-orm"

import { bookmarks } from "../public/bookmarks"
import { profiles } from "../public/profiles"
import { progress } from "../public/progress"
import { userClasses } from "../public/user-classes"
import { userRecentClasses } from "../public/user-recent-classes"
import { answerAttempts } from "../quiz/answer-attempts"
import { quizzes } from "../quiz/quizzes"
import { quizQuestions } from "../quiz/quiz-questions"
import { classes } from "./classes"
import { courseClasses } from "./course-classes"
import { courses } from "./courses"
import { courseMaintainers } from "./course-maintainers"
import { departmentAdmins } from "./department-admins"
import { departments } from "./departments"
import { departmentLocations } from "./department-locations"
import { questions } from "./questions"
import { sectionAccess } from "./section-access"
import { sections } from "./sections"

export const departmentsRelations = relations(departments, ({ many }) => ({
  courses: many(courses),
  locations: many(departmentLocations),
  admins: many(departmentAdmins),
}))

export const departmentLocationsRelations = relations(
  departmentLocations,
  ({ one }) => ({
    department: one(departments, {
      fields: [departmentLocations.departmentId],
      references: [departments.id],
    }),
  }),
)

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

export const coursesRelations = relations(courses, ({ one, many }) => ({
  department: one(departments, {
    fields: [courses.departmentId],
    references: [departments.id],
  }),
  courseClasses: many(courseClasses),
  maintainers: many(courseMaintainers),
  userClasses: many(userClasses),
  userRecentClasses: many(userRecentClasses),
}))

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

export const classesRelations = relations(classes, ({ many }) => ({
  courseClasses: many(courseClasses),
  sections: many(sections),
  userClasses: many(userClasses),
  userRecentClasses: many(userRecentClasses),
}))

export const courseClassesRelations = relations(courseClasses, ({ one }) => ({
  course: one(courses, {
    fields: [courseClasses.courseId],
    references: [courses.id],
  }),
  class: one(classes, {
    fields: [courseClasses.classId],
    references: [classes.id],
  }),
}))

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class: one(classes, {
    fields: [sections.classId],
    references: [classes.id],
  }),
  questions: many(questions),
  access: many(sectionAccess),
  quizzes: many(quizzes),
  progress: many(progress),
}))

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

export const questionsRelations = relations(questions, ({ one, many }) => ({
  section: one(sections, {
    fields: [questions.sectionId],
    references: [sections.id],
  }),
  bookmarks: many(bookmarks),
  quizQuestions: many(quizQuestions),
  answerAttempts: many(answerAttempts),
}))
