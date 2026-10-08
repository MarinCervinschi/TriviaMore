import { relations } from "drizzle-orm";

import { classes } from "../catalog/classes";
import { courseCurricula } from "../catalog/course-curricula";
import { courses } from "../catalog/courses";
import { profiles } from "../public/profiles";
import { careerExams } from "./career-exams";
import { enrollments } from "./enrollments";

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

export const careerExamsRelations = relations(careerExams, ({ one }) => ({
	enrollment: one(enrollments, {
		fields: [careerExams.enrollmentId],
		references: [enrollments.id],
	}),
	class: one(classes, {
		fields: [careerExams.classId],
		references: [classes.id],
	}),
}));
