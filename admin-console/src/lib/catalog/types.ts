export type CatalogOverview = {
	courses: number;
	classes: number;
	studiable: number;
	studiableWithSyllabus: number;
	syllabi: number;
	planRows: number;
	curricula: number;
	firstCohort: number | null;
	lastCohort: number | null;
	plansUpdatedAt: string | null;
	syllabiUpdatedAt: string | null;
};

export type CatalogCourse = {
	id: string;
	code: string;
	name: string;
	department: string;
	courseType: string;
	cohorts: number;
	lastCohort: number | null;
	/** Curricula of the latest cohort, the common trunk left out. */
	curricula: number;
	/** Plan rows of the latest cohort. */
	planRows: number;
	/** Share of the latest cohort's plan rows linked to one of our classes, from 0 to 1. */
	linkedShare: number | null;
	updatedAt: string | null;
};

export type CatalogClass = {
	id: string;
	name: string;
	/** The code of its first listing; a class shared by several courses has one per course. */
	code: string | null;
	cfu: number | null;
	courses: number;
	courseCodes: string[];
	departments: string[];
	/** In the current offering, and something a student can study. */
	studiable: boolean;
	/** The academic year of its official class sheet, or null without one. */
	syllabusYear: number | null;
};

export type ClassListing = {
	courseId: string;
	courseCode: string;
	courseName: string;
	department: string;
	code: string;
	classYear: number;
	mandatory: boolean;
	taf: string | null;
	teachingPeriod: string | null;
	catalogueUrl: string | null;
	studiable: boolean;
};

export type ClassDetail = {
	id: string;
	name: string;
	cfu: number | null;
	ssd: string | null;
	listings: ClassListing[];
	syllabus: {
		academicYear: number;
		catalogueUrl: string | null;
		/** The labels of the fields the sheet fills in. */
		filled: string[];
	} | null;
	sections: number;
	questions: number;
};

export type CourseCohort = {
	cohort: number;
	planRows: number;
	linked: number;
	curricula: number;
	updatedAt: string | null;
};

export type CourseDetail = {
	id: string;
	code: string;
	name: string;
	department: string;
	departmentName: string;
	courseType: string;
	cfu: number | null;
	location: string | null;
	degreeClass: string | null;
	teachingLanguage: string | null;
	restrictedAccess: boolean | null;
	catalogueUrl: string | null;
	classes: number;
	cohorts: CourseCohort[];
};
