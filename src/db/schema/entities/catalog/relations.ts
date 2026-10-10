import { relations } from "drizzle-orm";

import { courseMaintainers } from "../internal/course-maintainers";
import { departmentAdmins } from "../internal/department-admins";
import { sectionAccess } from "../internal/section-access";
import { bookmarks } from "../public/bookmarks";
import { userClasses } from "../public/user-classes";
import { userRecentClasses } from "../public/user-recent-classes";
import { answerAttempts } from "../quiz/answer-attempts";
import { quizQuestions } from "../quiz/quiz-questions";
import { quizzes } from "../quiz/quizzes";
import { classSyllabi } from "./class-syllabi";
import { classes } from "./classes";
import { courseClasses } from "./course-classes";
import { courseCurricula } from "./course-curricula";
import { coursePlans } from "./course-plans";
import { courses } from "./courses";
import { departmentLocations } from "./department-locations";
import { departments } from "./departments";
import { questions } from "./questions";
import { sections } from "./sections";

export const departmentsRelations = relations(departments, ({ many }) => ({
	courses: many(courses),
	locations: many(departmentLocations),
	admins: many(departmentAdmins),
}));

export const departmentLocationsRelations = relations(
	departmentLocations,
	({ one }) => ({
		department: one(departments, {
			fields: [departmentLocations.departmentId],
			references: [departments.id],
		}),
	})
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
	department: one(departments, {
		fields: [courses.departmentId],
		references: [departments.id],
	}),
	courseClasses: many(courseClasses),
	maintainers: many(courseMaintainers),
	userClasses: many(userClasses),
	userRecentClasses: many(userRecentClasses),
}));

export const classesRelations = relations(classes, ({ many }) => ({
	courseClasses: many(courseClasses),
	sections: many(sections),
	userClasses: many(userClasses),
	userRecentClasses: many(userRecentClasses),
}));

export const courseClassesRelations = relations(courseClasses, ({ one }) => ({
	course: one(courses, {
		fields: [courseClasses.courseId],
		references: [courses.id],
	}),
	class: one(classes, {
		fields: [courseClasses.classId],
		references: [classes.id],
	}),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
	class: one(classes, {
		fields: [sections.classId],
		references: [classes.id],
	}),
	questions: many(questions),
	access: many(sectionAccess),
	quizzes: many(quizzes),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
	section: one(sections, {
		fields: [questions.sectionId],
		references: [sections.id],
	}),
	bookmarks: many(bookmarks),
	quizQuestions: many(quizQuestions),
	answerAttempts: many(answerAttempts),
}));

export const coursePlansRelations = relations(coursePlans, ({ one }) => ({
	course: one(courses, { fields: [coursePlans.courseId], references: [courses.id] }),
	class: one(classes, { fields: [coursePlans.classId], references: [classes.id] }),
	curriculum: one(courseCurricula, {
		fields: [coursePlans.curriculumId],
		references: [courseCurricula.id],
	}),
}));

export const courseCurriculaRelations = relations(courseCurricula, ({ one, many }) => ({
	course: one(courses, {
		fields: [courseCurricula.courseId],
		references: [courses.id],
	}),
	plans: many(coursePlans),
}));

export const classSyllabiRelations = relations(classSyllabi, ({ one }) => ({
	class: one(classes, { fields: [classSyllabi.classId], references: [classes.id] }),
}));
