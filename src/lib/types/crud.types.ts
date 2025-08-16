export type NodeType = "department" | "course" | "class" | "section" | "question";

export interface DepartmentBody {
	name: string;
	code: string;
	description?: string;
	position?: number;
}

export interface CourseBody {
	name: string;
	code: string;
	description?: string;
	departmentId: string;
	courseType: "BACHELOR" | "MASTER";
	position?: number;
}

export interface ClassBody {
	name: string;
	code: string;
	description?: string;
	courseId: string;
	classYear: 1 | 2 | 3 | 4 | 5;
	position?: number;
}

export interface SectionBody {
	name: string;
	description?: string;
	classId: string;
	isPublic: boolean;
	position?: number;
}

export interface QuestionBody {
	content: string;
	questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options?: any;
	correctAnswer: string[];
	explanation?: string;
	difficulty: "EASY" | "MEDIUM" | "HARD";
	sectionId: string;
}

export interface UpdateDepartmentBody {
	name?: string;
	code?: string;
	description?: string;
	position?: number;
}

export interface UpdateCourseBody {
	name?: string;
	code?: string;
	description?: string;
	departmentId?: string;
	courseType?: "BACHELOR" | "MASTER";
	position?: number;
}

export interface UpdateClassBody {
	name?: string;
	code?: string;
	description?: string;
	courseId?: string;
	classYear?: 1 | 2 | 3 | 4 | 5;
	position?: number;
}

export interface UpdateSectionBody {
	name?: string;
	description?: string;
	classId?: string;
	isPublic?: boolean;
	position?: number;
}

export interface UpdateQuestionBody {
	content?: string;
	questionType?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	options?: any;
	correctAnswer?: string[];
	explanation?: string;
	difficulty?: "EASY" | "MEDIUM" | "HARD";
	sectionId?: string;
}
