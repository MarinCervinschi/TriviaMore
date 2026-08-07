import type {
	classes,
	courseClasses,
	courses,
	departmentLocations,
	departments,
	sections,
} from "@/db/schema";

// `fts` is a generated tsvector: it drives search server-side and has no
// business crossing the wire, so it is stripped from every browse view model.
export type Department = typeof departments.$inferSelect;
export type Course = Omit<typeof courses.$inferSelect, "fts">;
export type Class = Omit<typeof classes.$inferSelect, "fts">;
export type Section = typeof sections.$inferSelect;

export type DepartmentArea = NonNullable<Department["area"]>;
export type CampusLocation = NonNullable<Course["location"]>;
export type CourseType = Course["courseType"];

export type DepartmentLocation = Pick<
	typeof departmentLocations.$inferSelect,
	| "id"
	| "name"
	| "address"
	| "latitude"
	| "longitude"
	| "campusLocation"
	| "isPrimary"
	| "position"
>;

// Fields that describe a class *as taught in a given course*, i.e. the junction
// row rather than the class itself.
export type CourseClassInfo = Pick<
	typeof courseClasses.$inferSelect,
	"code" | "classYear" | "mandatory" | "catalogueUrl" | "curriculum" | "position"
>;

// Listing types

export type BrowseDepartment = Department & {
	courseCount: number;
	campusLocations: CampusLocation[];
};

export type BrowseCourse = Course & {
	classCount: number;
};

// A class seen from inside a course: junction fields merged into the class.
// `position` drops out of the class side — in a course listing it always means
// the position inside that course.
export type BrowseClassInCourse = Omit<Class, "position"> &
	CourseClassInfo & {
		sectionCount: number;
	};

export type BrowseSection = Section & {
	questionCount: number;
	quizQuestionCount: number;
	flashcardQuestionCount: number;
};

// Detail types

export type DepartmentWithCourses = Department & {
	courses: BrowseCourse[];
	locations: DepartmentLocation[];
};

export type CourseWithClasses = Course & {
	department: Department;
	classes: BrowseClassInCourse[];
};

export type ClassWithSections = Class & {
	courseClass: CourseClassInfo;
	course: Course & { department: Department };
	sections: BrowseSection[];
	examSimulation?: {
		sectionId: string;
		totalQuizQuestions: number;
		totalFlashcardQuestions: number;
	};
};

export type SectionDetail = Section & {
	class: Class & {
		courseClass: CourseClassInfo;
		course: Course & { department: Department };
	};
	questionCount: number;
	quizQuestionCount: number;
	flashcardQuestionCount: number;
};

// Overview (the /browse showcase page)

export type PlatformStats = {
	departments: number;
	courses: number;
	classes: number;
	sections: number;
	questions: number;
};

export type OverviewLocation = DepartmentLocation & {
	department: Pick<Department, "code" | "name">;
};

export interface BrowseOverview {
	stats: PlatformStats;
	coursesByDepartment: { name: string; code: string; count: number }[];
	coursesByType: { type: string; label: string; count: number }[];
	coursesByCampus: { campus: string; label: string; count: number }[];
	locations: OverviewLocation[];
	topContributedClasses: {
		id: string;
		name: string;
		deptCode: string;
		courseCode: string;
		classCode: string;
		sectionCount: number;
		questionCount: number;
		deptArea: string | null;
	}[];
	questionsByType: { type: string; label: string; count: number }[];
}

// Search

export type SearchCourseResult = {
	id: string;
	name: string;
	code: string;
	courseType: CourseType;
	location: CampusLocation | null;
	cfu: number | null;
	department: Pick<Department, "code" | "name">;
	classCount: number;
};

export type SearchClassResult = {
	id: string;
	name: string;
	description: string | null;
	cfu: number | null;
	code: string;
	classYear: number;
	mandatory: boolean;
	course: {
		id: string;
		name: string;
		code: string;
		department: Pick<Department, "code" | "name">;
	};
	sectionCount: number;
};

export interface SearchCoursesParams {
	query?: string;
	departmentId?: string;
	courseType?: string;
	campus?: string;
	page?: number;
	pageSize?: number;
}

export interface SearchClassesParams {
	query?: string;
	departmentId?: string;
	courseId?: string;
	classYear?: number;
	mandatory?: boolean;
	page?: number;
	pageSize?: number;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
}

export type SearchCoursesResponse = PaginatedResult<SearchCourseResult>;
export type SearchClassesResponse = PaginatedResult<SearchClassResult>;

// Graph showcase

export type GraphDepartmentNode = Pick<Department, "id" | "code" | "name" | "area">;

export type GraphCourseNode = Pick<
	Course,
	"id" | "code" | "name" | "departmentId" | "courseType" | "location"
>;

export interface GraphData {
	departments: GraphDepartmentNode[];
	courses: GraphCourseNode[];
}
