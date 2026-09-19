import type { courses, enrollments } from "@/db/schema";

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

type CourseType = (typeof courses.$inferSelect)["courseType"];

export interface CurrentEnrollment {
	id: string;
	courseId: string;
	courseName: string;
	courseCode: string;
	courseType: CourseType;
	courseCfu: number | null;
	departmentId: string;
	departmentName: string;
	departmentCode: string;
	curriculum: string | null;
	startYear: number | null;
}
