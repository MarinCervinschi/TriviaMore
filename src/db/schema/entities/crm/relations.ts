import { relations } from "drizzle-orm";

import { classes } from "../catalog/classes";
import { courseCurricula } from "../catalog/course-curricula";
import { courses } from "../catalog/courses";
import { profiles } from "../public/profiles";
import { calendarEvents } from "./calendar-events";
import { careerExams } from "./career-exams";
import { enrollments } from "./enrollments";
import { examSittings } from "./exam-sittings";
import { tasks } from "./tasks";

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
	user: one(profiles, {
		fields: [enrollments.userId],
		references: [profiles.id],
	}),
	course: one(courses, {
		fields: [enrollments.courseId],
		references: [courses.id],
	}),
	curriculum: one(courseCurricula, {
		fields: [enrollments.curriculumId],
		references: [courseCurricula.id],
	}),
	exams: many(careerExams),
}));

export const careerExamsRelations = relations(careerExams, ({ one, many }) => ({
	enrollment: one(enrollments, {
		fields: [careerExams.enrollmentId],
		references: [enrollments.id],
	}),
	class: one(classes, {
		fields: [careerExams.classId],
		references: [classes.id],
	}),
	sittings: many(examSittings),
}));

export const examSittingsRelations = relations(examSittings, ({ one }) => ({
	exam: one(careerExams, {
		fields: [examSittings.careerExamId],
		references: [careerExams.id],
	}),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
	user: one(profiles, {
		fields: [calendarEvents.userId],
		references: [profiles.id],
	}),
	exam: one(careerExams, {
		fields: [calendarEvents.careerExamId],
		references: [careerExams.id],
	}),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
	user: one(profiles, {
		fields: [tasks.userId],
		references: [profiles.id],
	}),
	exam: one(careerExams, {
		fields: [tasks.careerExamId],
		references: [careerExams.id],
	}),
}));
