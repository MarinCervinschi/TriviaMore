import { lazy, Suspense, useState } from "react"
import { ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

const StartQuizDialog = lazy(
  () =>
    import("@/components/quiz/start-quiz-dialog").then((m) => ({
      default: m.StartQuizDialog,
    })),
)

export function QuizCard({
  questionCount,
  sectionId,
  isAuthenticated,
}: {
  questionCount: number
  sectionId: string
  isAuthenticated: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (questionCount === 0) return null

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card p-6 transition-all duration-300 hover:shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-[40px]" />

        <div className="relative">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-500/10 p-3">
            <BookOpen className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-xl font-semibold tracking-tight">Quiz</h3>
          <p className="mb-6 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {questionCount}
            </span>{" "}
            domande disponibili per il quiz. Metti alla prova le tue conoscenze.
          </p>
          <Button
            className="w-full shadow-sm"
            onClick={() => setDialogOpen(true)}
          >
            Inizia Quiz
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      {dialogOpen && (
        <Suspense>
          <StartQuizDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            sectionId={sectionId}
            maxQuestions={questionCount}
            isAuthenticated={isAuthenticated}
          />
        </Suspense>
      )}
    </>
  )
}
