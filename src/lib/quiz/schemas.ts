import { z } from "zod"

export const startQuizSchema = z.object({
  sectionId: z.string().uuid(),
  questionCount: z.number().min(1).max(100).default(30),
  timeLimit: z.number().nullable().default(30),
  quizMode: z.enum(["STUDY", "EXAM_SIMULATION"]).default("STUDY"),
  evaluationModeId: z.string().uuid().optional(),
})

export const completeQuizSchema = z.object({
  quizAttemptId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      userAnswer: z.array(z.string()),
      score: z.number(),
    }),
  ),
  totalScore: z.number(),
  timeSpent: z.number(),
})

export const attemptIdSchema = z.object({ quizAttemptId: z.string().uuid() })
export const quizIdSchema = z.object({ quizId: z.string().uuid() })
export const resultsSchema = z.object({ attemptId: z.string().uuid() })

export type StartQuizInput = z.infer<typeof startQuizSchema>
export type CompleteQuizInput = z.infer<typeof completeQuizSchema>
