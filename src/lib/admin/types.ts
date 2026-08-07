import type {
	courseClasses,
	courses,
	departments,
	profiles,
	questions as questionsTable,
} from "@/db/schema";
import type { UserRole } from "@/lib/auth/types";

// `fts` is generated and never leaves the server.
export type Department = typeof departments.$inferSelect;
export type Course = Omit<typeof courses.$inferSelect, "fts">;
export type CourseClassInfo = Pick<
	typeof courseClasses.$inferSelect,
	"code" | "classYear" | "mandatory" | "catalogueUrl" | "curriculum" | "position"
>;

export type AdminDepartment = Department & { courseCount: number };

export type AdminDepartmentDetail = Department & {
	courses: (Course & { classCount: number })[];
};

export type AdminCourseDetail = Course & {
	department: Department;
	classes: (CourseClassInfo & {
		id: string;
		name: string;
		description: string | null;
		cfu: number | null;
		sectionCount: number;
	})[];
};

export type AdminClassDetail = {
	id: string;
	name: string;
	description: string | null;
	cfu: number | null;
	position: number;
	createdAt: string;
	updatedAt: string;
	courseClass: CourseClassInfo | null;
	course: (Course & { department: Department }) | null;
	sections: {
		id: string;
		name: string;
		description: string | null;
		isPublic: boolean;
		position: number;
		questionCount: number;
	}[];
	hasExamSimulation: boolean;
};

// Breadcrumb above a section or a question, through the primary course.
export type AdminParentChain = {
	classCode: string;
	courseName: string;
	courseCode: string;
	departmentName: string;
	departmentCode: string;
};

export type AdminSectionDetail = {
	id: string;
	name: string;
	description: string | null;
	isPublic: boolean;
	classId: string;
	position: number;
	slug: string | null;
	createdAt: string;
	updatedAt: string;
	className: string;
	parent: (AdminParentChain & { courseId: string }) | null;
	questions: AdminQuestion[];
};

export type AdminQuestion = typeof questionsTable.$inferSelect;

export type AdminQuestionDetail = Omit<AdminQuestion, "sectionId"> & {
	sectionId: string;
	sectionName: string;
	classId: string;
	className: string;
	parent: AdminParentChain | null;
};

// Content tree for sidebar navigation. Names only: the tree renders labels and
// child counts, nothing else.
export type ContentTreeDepartment = {
	id: string;
	name: string;
	courses: ContentTreeCourse[];
};

export type ContentTreeCourse = {
	id: string;
	name: string;
	classes: ContentTreeClass[];
};

export type ContentTreeClass = {
	id: string;
	name: string;
	sections: ContentTreeSection[];
};

export type ContentTreeSection = {
	id: string;
	name: string;
};

// Admin dashboard stats
export type AdminStats = {
	departmentCount: number;
	courseCount: number;
	classCount: number;
	sectionCount: number;
	questionCount: number;
};

// Admin permissions
export type AdminPermissions = {
	role: UserRole;
	managedDepartmentIds: string[];
	maintainedCourseIds: string[];
};

// ─── User Management ───

export type { UserRole };

type AdminUserBase = Pick<
	typeof profiles.$inferSelect,
	"id" | "name" | "email" | "image" | "role" | "createdAt"
>;

export type AdminUser = AdminUserBase & { quizAttemptsCount: number };

export type AdminUserDetail = AdminUserBase & {
	managedDepartments: { id: string; name: string; code: string }[];
	maintainedCourses: {
		id: string;
		name: string;
		code: string;
		departmentName: string;
	}[];
	sectionAccesses: {
		id: string;
		name: string;
		className: string;
	}[];
	stats: {
		totalQuizzes: number;
		averageScore: number | null;
		lastQuizAt: string | null;
	};
};

export type AdminUserStats = {
	totalUsers: number;
	byRole: Record<string, number>;
	totalQuizAttempts: number;
	recentQuizAttempts: number;
	averageScore: number | null;
	activeUsers: number;
};
