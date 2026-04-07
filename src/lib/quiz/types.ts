import type { Json } from "@/lib/supabase/database.types"

export type QuizQuestion = {
  id: string
  content: string
  question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  options: Json | null
  correct_answer: string[]
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  order: number
}

export type QuizSection = {
  id: string
  name: string
  class: {
    name: string
  }
  course_name: string | null
  department_name: string | null
}

export type EvaluationMode = {
  id: string
  name: string
  description: string | null
  correct_answer_points: number
  incorrect_answer_points: number
  partial_credit_enabled: boolean
}

export type Quiz = {
  id: string
  time_limit: number | null
  quiz_mode: "STUDY" | "EXAM_SIMULATION"
  evaluation_mode: EvaluationMode
  section: QuizSection
  questions: QuizQuestion[]
  attempt_id?: string
}

export type UserAnswer = {
  questionId: string
  answer: string[]
  isCorrect?: boolean
  score?: number
}

export type QuizResults = {
  totalScore: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  quizId: string
  quizTitle: string
  evaluationMode: EvaluationMode
  questions: {
    id: string
    content: string
    options: Json | null
    correctAnswer: string[]
  }[]
  answers: {
    questionId: string
    answer: string[]
    isCorrect: boolean
    score: number
  }[]
}

export type QuizAttemptResult = {
  id: string
  score: number
  time_spent: number | null
  completed_at: string
  quiz: {
    id: string
    quiz_mode: "STUDY" | "EXAM_SIMULATION"
    time_limit: number | null
    section: QuizSection
    evaluation_mode: EvaluationMode
    questions: {
      id: string
      content: string
      question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
      options: Json | null
      correct_answer: string[]
      explanation: string | null
      difficulty: "EASY" | "MEDIUM" | "HARD"
    }[]
  }
  answers: {
    question_id: string
    user_answer: string[]
    score: number
  }[]
}
