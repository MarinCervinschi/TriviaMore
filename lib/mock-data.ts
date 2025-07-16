export const mockDepartments = [
  {
    id: "dept-1",
    name: "Department of Engineering",
    code: "DIEF",
    description: "Engineering and technical sciences",
    courses: [
      {
        id: "course-1",
        name: "Computer Engineering",
        code: "CE",
        description: "Computer systems and software engineering",
        departmentId: "dept-1",
        classes: [
          {
            id: "class-1",
            name: "Algorithms",
            code: "ALG101",
            description: "Data structures and algorithms",
            courseId: "course-1",
            sections: [
              {
                id: "section-1",
                name: "Complexity Analysis",
                description: "Big O notation and algorithm complexity",
                isPublic: true,
                classId: "class-1",
              },
              {
                id: "section-2",
                name: "Sorting Algorithms",
                description: "Various sorting techniques",
                isPublic: true,
                classId: "class-1",
              },
            ],
          },
          {
            id: "class-2",
            name: "Calculus I",
            code: "CALC101",
            description: "Differential and integral calculus",
            courseId: "course-1",
            sections: [
              {
                id: "section-3",
                name: "Derivatives",
                description: "Derivative rules and applications",
                isPublic: true,
                classId: "class-2",
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
        classes: [
          {
            id: "class-3",
            name: "Thermodynamics",
            code: "THERMO101",
            description: "Heat and energy transfer",
            courseId: "course-2",
            sections: [
              {
                id: "section-4",
                name: "First Law",
                description: "Conservation of energy",
                isPublic: true,
                classId: "class-3",
              },
            ],
          },
        ],
      },
    ],
  },
]

export const mockQuestions = [
  {
    id: "q1",
    content: "What is the time complexity of binary search?",
    type: "MULTIPLE_CHOICE",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: "O(log n)",
    explanation: "Binary search divides the search space in half with each comparison",
    difficulty: "MEDIUM",
    sectionId: "section-1",
    section: {
      id: "section-1",
      name: "Complexity Analysis",
      class: {
        name: "Algorithms",
        course: {
          name: "Computer Engineering",
          department: { name: "Department of Engineering" },
        },
      },
    },
  },
  {
    id: "q2",
    content: "Bubble sort is a stable sorting algorithm.",
    type: "TRUE_FALSE",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Bubble sort maintains the relative order of equal elements",
    difficulty: "EASY",
    sectionId: "section-2",
    section: {
      id: "section-2",
      name: "Sorting Algorithms",
      class: {
        name: "Algorithms",
        course: {
          name: "Computer Engineering",
          department: { name: "Department of Engineering" },
        },
      },
    },
  },
  {
    id: "q3",
    content: "What is the derivative of x²?",
    type: "SHORT_ANSWER",
    options: null,
    correctAnswer: "2x",
    explanation: "Using the power rule: d/dx(x^n) = nx^(n-1)",
    difficulty: "EASY",
    sectionId: "section-3",
    section: {
      id: "section-3",
      name: "Derivatives",
      class: {
        name: "Calculus I",
        course: {
          name: "Computer Engineering",
          department: { name: "Department of Engineering" },
        },
      },
    },
  },
]

export const mockQuizzes = [
  {
    id: "quiz-1",
    title: "Algorithm Complexity Quiz",
    description: "Test your understanding of Big O notation",
    timeLimit: 30,
    isActive: true,
    sectionId: "section-1",
    section: {
      id: "section-1",
      name: "Complexity Analysis",
      class: {
        name: "Algorithms",
        course: {
          name: "Computer Engineering",
          department: { name: "Department of Engineering" },
        },
      },
    },
    questions: [
      {
        id: "qq1",
        quizId: "quiz-1",
        questionId: "q1",
        order: 1,
        question: mockQuestions[0],
      },
    ],
  },
  {
    id: "quiz-2",
    title: "Sorting Fundamentals",
    description: "Basic sorting algorithm concepts",
    timeLimit: 20,
    isActive: true,
    sectionId: "section-2",
    section: {
      id: "section-2",
      name: "Sorting Algorithms",
      class: {
        name: "Algorithms",
        course: {
          name: "Computer Engineering",
          department: { name: "Department of Engineering" },
        },
      },
    },
    questions: [
      {
        id: "qq2",
        quizId: "quiz-2",
        questionId: "q2",
        order: 1,
        question: mockQuestions[1],
      },
    ],
  },
]

export const mockUser = {
  id: "user-1",
  username: "student1",
  email: "student1@example.com",
  role: "STUDENT",
}

export const mockAdmin = {
  id: "admin-1",
  username: "admin",
  email: "admin@example.com",
  role: "ADMIN",
}

export const mockProgress = [
  {
    id: "prog-1",
    userId: "user-1",
    sectionId: "section-1",
    questionsStudied: 5,
    quizzesTaken: 2,
    averageScore: 85.5,
    lastAccessedAt: new Date().toISOString(),
    section: {
      id: "section-1",
      name: "Complexity Analysis",
      class: {
        name: "Algorithms",
        course: {
          name: "Computer Engineering",
          department: { name: "Department of Engineering" },
        },
      },
    },
  },
]

export const mockQuizAttempts = [
  {
    id: "attempt-1",
    userId: "user-1",
    quizId: "quiz-1",
    score: 100,
    totalQuestions: 1,
    correctAnswers: 1,
    timeSpent: 120,
    completedAt: new Date().toISOString(),
    quiz: {
      title: "Algorithm Complexity Quiz",
      section: {
        name: "Complexity Analysis",
        class: {
          name: "Algorithms",
          course: {
            name: "Computer Engineering",
            department: { name: "Department of Engineering" },
          },
        },
      },
    },
  },
]

export const mockBookmarks = [
  {
    id: "bookmark-1",
    userId: "user-1",
    questionId: "q1",
    createdAt: new Date().toISOString(),
    question: mockQuestions[0],
  },
]
