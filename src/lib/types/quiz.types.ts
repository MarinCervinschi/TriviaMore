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

export interface QuizSection {
  id: string;
  name: string;
  class: {
    name: string;
    course: {
      name: string;
      department: {
        name: string;
      };
    };
  };
}

export interface Quiz {
  id: string;
  timeLimit?: number;
  evaluationMode: EvaluationMode;
  quizMode: QuizMode;
  section: QuizSection;
  questions: QuizQuestion[];
}

export interface EvaluationMode {
  name: string;
  description?: string;
  correctAnswerPoints: number;
  incorrectAnswerPoints: number;
  partialCreditEnabled: boolean;
  
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
}