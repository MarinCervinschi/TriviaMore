import {
  mockDepartments,
  mockQuestions,
  mockQuizzes,
  mockUser,
  mockAdmin,
  mockProgress,
  mockQuizAttempts,
  mockBookmarks,
} from "./mock-data"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockAPI {
  static async login(username: string, password: string) {
    await delay(500)

    if (username === "admin" && password === "admin") {
      return {
        user: mockAdmin,
        token: "mock-admin-token",
      }
    } else if (username === "student1" && password === "student1") {
      return {
        user: mockUser,
        token: "mock-student-token",
      }
    }

    throw new Error("Invalid credentials")
  }

  static async getDepartments() {
    await delay(300)
    return mockDepartments
  }

  static async createDepartment(data: any) {
    await delay(500)
    const newDept = {
      id: `dept-${Date.now()}`,
      ...data,
      courses: [],
    }
    mockDepartments.push(newDept)
    return newDept
  }

  static async updateDepartment(id: string, data: any) {
    await delay(500)
    const index = mockDepartments.findIndex((d) => d.id === id)
    if (index !== -1) {
      mockDepartments[index] = { ...mockDepartments[index], ...data }
      return mockDepartments[index]
    }
    throw new Error("Department not found")
  }

  static async deleteDepartment(id: string) {
    await delay(500)
    const index = mockDepartments.findIndex((d) => d.id === id)
    if (index !== -1) {
      mockDepartments.splice(index, 1)
      return { message: "Department deleted" }
    }
    throw new Error("Department not found")
  }

  static async getQuestions(sectionId?: string) {
    await delay(300)
    if (sectionId) {
      return mockQuestions.filter((q) => q.sectionId === sectionId)
    }
    return mockQuestions
  }

  static async getQuizzes(sectionId?: string) {
    await delay(300)
    if (sectionId) {
      return mockQuizzes.filter((q) => q.sectionId === sectionId)
    }
    return mockQuizzes
  }

  static async submitQuizAttempt(quizId: string, answers: any[], timeSpent: number) {
    await delay(800)

    const quiz = mockQuizzes.find((q) => q.id === quizId)
    if (!quiz) throw new Error("Quiz not found")

    let correctAnswers = 0
    const answerAttempts = []

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.questionId === answer.questionId)
      if (question) {
        const isCorrect = question.question.correctAnswer === answer.userAnswer
        if (isCorrect) correctAnswers++

        answerAttempts.push({
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          isCorrect,
          timeSpent: answer.timeSpent || 0,
          question: question.question,
        })
      }
    }

    const score = (correctAnswers / quiz.questions.length) * 100

    const attempt = {
      id: `attempt-${Date.now()}`,
      userId: mockUser.id,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      completedAt: new Date().toISOString(),
      answers: answerAttempts,
      quiz,
    }

    mockQuizAttempts.push(attempt)
    return attempt
  }

  static async getDashboard() {
    await delay(400)
    return {
      progress: mockProgress,
      recentAttempts: mockQuizAttempts,
      bookmarks: mockBookmarks,
      stats: {
        totalQuizzes: mockQuizAttempts.length,
        averageScore: mockQuizAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / mockQuizAttempts.length,
        totalBookmarks: mockBookmarks.length,
      },
    }
  }

  static async toggleBookmark(questionId: string) {
    await delay(200)
    const existingIndex = mockBookmarks.findIndex((b) => b.questionId === questionId)

    if (existingIndex !== -1) {
      mockBookmarks.splice(existingIndex, 1)
      return { bookmarked: false }
    } else {
      const question = mockQuestions.find((q) => q.id === questionId)
      if (question) {
        mockBookmarks.push({
          id: `bookmark-${Date.now()}`,
          userId: mockUser.id,
          questionId,
          createdAt: new Date().toISOString(),
          question,
        })
      }
      return { bookmarked: true }
    }
  }
}
