import type { EvaluationMode, QuizQuestion, QuizResults, UserAnswer } from "./types"

export function calculateAnswerScore(
  userAnswer: string[],
  correctAnswer: string[],
  evaluationMode: EvaluationMode,
): { score: number; isCorrect: boolean } {
  if (userAnswer.length === 0) {
    return { score: 0, isCorrect: false }
  }

  const correctGiven = userAnswer.filter((ans) =>
    correctAnswer.includes(ans),
  ).length
  const incorrectGiven = userAnswer.filter(
    (ans) => !correctAnswer.includes(ans),
  ).length
  const totalCorrect = correctAnswer.length
  const totalGiven = userAnswer.length

  // Exact match
  if (
    correctGiven === totalCorrect &&
    incorrectGiven === 0 &&
    totalGiven === totalCorrect
  ) {
    return {
      score: evaluationMode.correct_answer_points,
      isCorrect: true,
    }
  }

  // Partial credit
  if (correctGiven > 0) {
    if (evaluationMode.partial_credit_enabled) {
      if (
        incorrectGiven > 0 &&
        evaluationMode.incorrect_answer_points === 0
      ) {
        return { score: 0, isCorrect: false }
      }

      const correctnessRatio = correctGiven / totalCorrect
      let score =
        evaluationMode.correct_answer_points * correctnessRatio

      if (
        incorrectGiven > 0 &&
        evaluationMode.incorrect_answer_points < 0
      ) {
        const penalty =
          incorrectGiven *
          Math.abs(evaluationMode.incorrect_answer_points)
        score = Math.max(
          score - penalty,
          evaluationMode.incorrect_answer_points,
        )
      }

      return { score: Number(score.toFixed(2)), isCorrect: false }
    }
    return { score: 0, isCorrect: false }
  }

  return {
    score: evaluationMode.incorrect_answer_points,
    isCorrect: false,
  }
}

export function calculateQuizResults(params: {
  userAnswers: UserAnswer[]
  questions: QuizQuestion[]
  evaluationMode: EvaluationMode
  startTime: number
  quizId: string
  quizTitle: string
}): QuizResults {
  const {
    userAnswers,
    questions,
    evaluationMode,
    startTime,
    quizId,
    quizTitle,
  } = params

  let totalScore = 0
  let correctAnswers = 0

  const answersWithResults = userAnswers.map((userAnswer) => {
    const question = questions.find((q) => q.id === userAnswer.questionId)
    if (!question) {
      return { ...userAnswer, isCorrect: false, score: 0 }
    }

    const { score, isCorrect } = calculateAnswerScore(
      userAnswer.answer,
      question.correct_answer,
      evaluationMode,
    )

    totalScore += score
    if (isCorrect) correctAnswers++

    return { ...userAnswer, isCorrect, score }
  })

  const maxScore =
    questions.length * evaluationMode.correct_answer_points
  const normalizedScore =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 33) : 0

  return {
    totalScore: Math.max(0, normalizedScore),
    correctAnswers,
    totalQuestions: questions.length,
    timeSpent: Date.now() - startTime,
    quizId,
    quizTitle,
    evaluationMode,
    questions: questions.map((q) => ({
      id: q.id,
      content: q.content,
      options: q.options,
      correctAnswer: q.correct_answer,
    })),
    answers: answersWithResults.map((a) => ({
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: a.isCorrect ?? false,
      score: a.score ?? 0,
    })),
  }
}
