export interface DepartmentNode {
  id: string;
  name: string;
  code: string;
  description?: string;
  position: number;
  courses?: CourseNode[];
  _count?: {
    courses: number;
  };
}

export interface CourseNode {
  id: string;
  name: string;
  code: string;
  description?: string;
  courseType: 'BACHELOR' | 'MASTER';
  position: number;
  departmentId: string;
  classes?: ClassNode[];
  _count?: {
    classes: number;
  };
}

export interface ClassNode {
  id: string;
  name: string;
  code: string;
  description?: string;
  classYear: number;
  position: number;
  courseId: string;
  sections?: SectionNode[];
  _count?: {
    sections: number;
  };
}

export interface SectionNode {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  position: number;
  classId: string;
  _count?: {
    questions: number;
  };
}

export interface BrowseTreeResponse {
  departments: DepartmentNode[];
}

export interface ExpandNodeRequest {
  nodeType: 'course' | 'class';
  nodeId: string;
}

export interface ExpandCourseResponse {
  classes: ClassNode[];
}

export interface ExpandClassResponse {
  sections: SectionNode[];
}
