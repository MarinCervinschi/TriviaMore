import { useCallback, useEffect, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { QuestionCard } from "@/components/quiz/question-card"
import { QuizHeader } from "@/components/quiz/quiz-header"
import { QuizNavigation } from "@/components/quiz/quiz-navigation"
import { QuizProgress } from "@/components/quiz/quiz-progress"
import { QuizSidebar, QuizSidebarContent } from "@/components/quiz/quiz-sidebar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { QuizPlaySkeleton } from "@/components/skeletons"
import { quizQueries } from "@/lib/quiz/queries"
import { calculateQuizResults } from "@/lib/quiz/scoring"
import { completeQuizFn, cancelQuizFn } from "@/lib/quiz/server"
import type { Quiz, UserAnswer } from "@/lib/quiz/types"

export const Route = createFileRoute("/quiz/$quizId")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quizQueries.quiz(params.quizId),
    )
  },
  pendingComponent: QuizPlaySkeleton,
  component: QuizPage,
})

function QuizPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const quiz = Route.useLoaderData() as Quiz | null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [startTime] = useState(Date.now())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)

  // Initialize answers when quiz loads
  useEffect(() => {
    if (quiz) {
      setUserAnswers(
        quiz.questions.map((q) => ({
          questionId: q.id,
          answer: [],
        })),
      )
    }
  }, [quiz])

  const handleAnswerChange = useCallback(
    (questionId: string, answer: string[]) => {
      setUserAnswers((prev) =>
        prev.map((ua) =>
          ua.questionId === questionId ? { ...ua, answer } : ua,
        ),
      )
    },
    [],
  )

  const handleComplete = useCallback(async () => {
    if (!quiz || !quiz.attempt_id) return

    const quizResults = calculateQuizResults({
      userAnswers,
      questions: quiz.questions,
      evaluationMode: quiz.evaluation_mode,
      startTime,
      quizId: quiz.id,
      quizTitle: `Quiz: ${quiz.section.name}`,
    })

    try {
      const { attemptId } = await completeQuizFn({
        data: {
          quizAttemptId: quiz.attempt_id,
          answers: quizResults.answers.map((a) => ({
            questionId: a.questionId,
            userAnswer: a.answer,
            score: a.score,
          })),
          totalScore: quizResults.totalScore,
          timeSpent: quizResults.timeSpent,
        },
      })
      // Invalidate user data caches so dashboard shows updated stats
      queryClient.invalidateQueries({ queryKey: ["user"] })
      navigate({
        to: "/quiz/results/$attemptId",
        params: { attemptId },
      })
    } catch (error) {
      console.error("Failed to complete quiz:", error)
    }
  }, [quiz, userAnswers, startTime, navigate, queryClient])

  const confirmExit = useCallback(async () => {
    if (quiz?.attempt_id) {
      try {
        await cancelQuizFn({ data: { quizAttemptId: quiz.attempt_id } })
      } catch {
        // Ignore cancel errors
      }
    }
    navigate({ to: "/" })
  }, [quiz, navigate])

  const handleJump = useCallback((index: number) => {
    setCurrentIndex(index)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileSidebarOpen(false)
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen((prev) => !prev)
    } else {
      setMobileSidebarOpen((prev) => !prev)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentIndex < (quiz?.questions.length ?? 0) - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, quiz?.questions.length])

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Quiz non trovato.</p>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentIndex]
  const currentAnswers =
    userAnswers.find((ua) => ua.questionId === currentQuestion?.id)
      ?.answer ?? []
  const answeredQuestions = quiz.questions.map((q) => {
    const ua = userAnswers.find((ua) => ua.questionId === q.id)
    return (ua?.answer.length ?? 0) > 0
  })

  return (
    <div className="flex h-dvh flex-col">
      <QuizHeader
        questionIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        timeLimit={quiz.time_limit}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onTimeUp={handleComplete}
        onExit={() => setShowExitDialog(true)}
      />
      <QuizProgress current={currentIndex} total={quiz.questions.length} />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <QuizSidebar
            totalQuestions={quiz.questions.length}
            currentIndex={currentIndex}
            answeredQuestions={answeredQuestions}
            onJump={handleJump}
          />
        )}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 overflow-y-auto p-4 lg:hidden">
            <QuizSidebarContent
              totalQuestions={quiz.questions.length}
              currentIndex={currentIndex}
              answeredQuestions={answeredQuestions}
              onJump={handleJump}
            />
          </SheetContent>
        </Sheet>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedAnswers={currentAnswers}
              onAnswerChange={(answers) =>
                handleAnswerChange(currentQuestion.id, answers)
              }
            />
          )}
        </div>
      </div>
      <QuizNavigation
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        onPrevious={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setCurrentIndex((prev) =>
            Math.min(quiz.questions.length - 1, prev + 1),
          )
        }
        onComplete={handleComplete}
      />
      <ConfirmationDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="Esci dal Quiz"
        description="Sei sicuro di voler uscire? Il quiz verrà eliminato e i progressi persi."
        confirmText="Esci"
        cancelText="Continua"
        variant="destructive"
        onConfirm={confirmExit}
      />
    </div>
  )
}
