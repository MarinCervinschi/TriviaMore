import type { DepartmentNode } from '@/lib/types/browse.types';

export const mockDepartments: DepartmentNode[] = [
  {
    id: "dept-1",
    name: "Department of Engineering",
    code: "DIEF",
    description: "Engineering and technical sciences",
    position: 0,
    _count: {
      courses: 2
    },
    courses: [
      {
        id: "course-1",
        name: "Computer Engineering",
        code: "CE",
        description: "Computer systems and software engineering",
        departmentId: "dept-1",
        courseType: "BACHELOR",
        position: 0,
        _count: {
          classes: 2
        },
        classes: [
          {
            id: "class-1",
            name: "Algorithms",
            code: "ALG101",
            description: "Data structures and algorithms",
            courseId: "course-1",
            classYear: 1,
            position: 0,
            _count: {
              sections: 2
            },
            sections: [
              {
                id: "section-1",
                name: "Complexity Analysis",
                description: "Big O notation and algorithm complexity",
                isPublic: true,
                classId: "class-1",
                position: 0,
                _count: {
                  questions: 25
                }
              },
              {
                id: "section-2",
                name: "Sorting Algorithms",
                description: "Various sorting techniques",
                isPublic: true,
                classId: "class-1",
                position: 1,
                _count: {
                  questions: 30
                }
              },
            ],
          },
          {
            id: "class-2",
            name: "Calculus I",
            code: "CALC101",
            description: "Differential and integral calculus",
            courseId: "course-1",
            classYear: 1,
            position: 1,
            _count: {
              sections: 1
            },
            sections: [
              {
                id: "section-3",
                name: "Derivatives",
                description: "Derivative rules and applications",
                isPublic: true,
                classId: "class-2",
                position: 0,
                _count: {
                  questions: 40
                }
              },
            ],
          },
        ],
      },
      {
        id: "course-2",
        name: "Mechanical Engineering",
        code: "ME",
        description: "Mechanical systems and design",
        departmentId: "dept-1",
        courseType: "BACHELOR",
        position: 1,
        _count: {
          classes: 1
        },
        classes: [
          {
            id: "class-3",
            name: "Thermodynamics",
            code: "THERMO101",
            description: "Heat and energy transfer",
            courseId: "course-2",
            classYear: 2,
            position: 0,
            _count: {
              sections: 1
            },
            sections: [
              {
                id: "section-4",
                name: "First Law",
                description: "Conservation of energy",
                isPublic: true,
                classId: "class-3",
                position: 0,
                _count: {
                  questions: 35
                }
              },
            ],
          },
        ],
      },
    ],
  },
];
