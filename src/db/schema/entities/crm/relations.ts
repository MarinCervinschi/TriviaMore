import { relations } from "drizzle-orm";

import { courses } from "../catalog/courses";
import { profiles } from "../public/profiles";
import { enrollments } from "./enrollments";

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
	user: one(profiles, {
		fields: [enrollments.userId],
		references: [profiles.id],
	}),
	course: one(courses, {
		fields: [enrollments.courseId],
		references: [courses.id],
	}),
}));
