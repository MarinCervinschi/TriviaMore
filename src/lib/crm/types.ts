import type { careerExams, courses, enrollments, examSittings } from "@/db/schema";

import type { CareerSettings, EntryColor } from "./schemas";

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

type CourseRow = typeof courses.$inferSelect;
type CourseType = CourseRow["courseType"];

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

/** The enrolment's course as the Carriera header shows it. */
export interface CareerCourse {
	id: string;
	code: string;
	name: string;
	cfu: number | null;
	courseType: CourseType;
	location: CourseRow["location"];
	degreeClass: string | null;
	teachingLanguage: string | null;
	catalogueUrl: string | null;
	department: { id: string; name: string; code: string };
}

export interface Career {
	course: CareerCourse;
	cohort: number | null;
	curriculumName: string | null;
	/** Why the plan cannot prefill the record yet, when it cannot. */
	planGap: "no-cohort" | "no-plan" | "no-curriculum" | null;
	/** Mandatory plan exams the record does not have yet; the prefill adds them. */
	missingMandatory: number;
	exams: CareerExam[];
	choiceGroups: CareerChoiceGroup[];
	settings: CareerSettings;
	/** False until the student saves the rules once; until then they are the defaults. */
	settingsSaved: boolean;
}

export type ExamSitting = typeof examSittings.$inferSelect;

/** An appello with the exam it belongs to, as the calendar draws it. */
export interface CalendarSitting {
	id: string;
	examId: string;
	examName: string;
	examPassed: boolean;
	date: string;
	label: string | null;
	importance: number;
	chosen: boolean;
}

/** A personal event; times are "HH:MM". */
export interface CalendarPersonalEvent {
	id: string;
	title: string;
	date: string;
	/** Inclusive, for an event on more than one day. */
	endDate: string | null;
	startTime: string | null;
	endTime: string | null;
	notes: string | null;
	/** An RFC 5545 rule, without the "RRULE:" prefix. */
	recurrence: string | null;
	color: EntryColor | null;
	examId: string | null;
	examName: string | null;
}

/** An exam of the record that an appello, an event or a task can point to. */
export interface CalendarExamOption {
	id: string;
	name: string;
	cfu: number;
	passed: boolean;
}

/** A to-do on a day of the calendar. Times are "HH:MM". */
export interface CalendarTask {
	id: string;
	title: string;
	notes: string | null;
	dueDate: string;
	dueTime: string | null;
	endTime: string | null;
	done: boolean;
	color: EntryColor | null;
	examId: string | null;
	examName: string | null;
}

export interface CalendarData {
	sittings: CalendarSitting[];
	events: CalendarPersonalEvent[];
	tasks: CalendarTask[];
	exams: CalendarExamOption[];
}
