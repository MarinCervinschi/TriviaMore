import { QuizMode, QuestionType, Difficulty } from '@prisma/client';

export interface QuizQuestion {
  id: string;
  content: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string[];
  explanation?: string;
  difficulty: Difficulty;
  order: number;
}

export interface Quiz {
  id: string;
  timeLimit?: number;
  sectionId: string;
  evaluationModeId: string;
  quizMode: QuizMode;
  questions: QuizQuestion[];
}

export interface GuestQuizRequest {
  sectionId: string;
  questionCount?: number;
  quizMode?: QuizMode;
}

export interface StartQuizRequest {
  sectionId: string;
  difficulty?: Difficulty;
  questionCount?: number;
  timeLimit?: number;
  quizMode: QuizMode;
  evaluationModeId: string;
}

export interface AnswerAttempt {
  questionId: string;
  userAnswer: string[];
  score: number;
}

export interface CompleteQuizRequest {
  quizAttemptId: string;
  answers: AnswerAttempt[];
  timeSpent: number;
}

export interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: AnswerAttempt[];
}

export interface QuizAttemptResponse {
  attemptId: string;
  quiz: Quiz;
}

export interface GuestQuizResponse {
  quiz: Quiz;
  tempId: string; // Per tracciare i quiz anonimi
}