import type { careerExams, courses, enrollments } from "@/db/schema";

import type { CareerSettings } from "./schemas";

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
	curriculumId: string | null;
	curriculumName: string | null;
	startYear: number | null;
}

/** A curriculum the student can pick for their cohort; the common trunk is never one. */
export interface CurriculumOption {
	id: string;
	code: string;
	name: string;
}

export type CareerExam = typeof careerExams.$inferSelect;

/** One of the plan's choice groups, with what the student already picked from it. */
export interface CareerChoiceGroup {
	code: string;
	label: string | null;
	classYear: number;
	options: { planCode: string; name: string; cfu: number; graded: boolean }[];
	chosen: string[];
}

export interface Career {
	courseName: string;
	courseCfu: number | null;
	cohort: number | null;
	curriculumName: string | null;
	/** Why the plan cannot prefill the record yet, when it cannot. */
	planGap: "no-cohort" | "no-plan" | "no-curriculum" | null;
	/** Mandatory plan exams the record does not have yet; the prefill adds them. */
	missingMandatory: number;
	exams: CareerExam[];
	choiceGroups: CareerChoiceGroup[];
	settings: CareerSettings;
}
