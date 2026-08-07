import { lazy, Suspense, useState } from "react"
import { BookOpen } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

import { SessionLaunchCard } from "./session-launch-card"

const StartQuizDialog = lazy(
  () =>
    import("@/components/quiz/start-quiz-dialog").then((m) => ({
      default: m.StartQuizDialog,
    })),
)

export function QuizCard({
  questionCount,
  sectionId,
}: {
  questionCount: number
  sectionId: string
}) {
  const { isAuthenticated } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (questionCount === 0) return null

  return (
    <>
      <SessionLaunchCard
        accent="blue"
        icon={BookOpen}
        title="Quiz"
        unitLabel="domande disponibili"
        count={questionCount}
        isAuthenticated={isAuthenticated}
        onStart={() => setDialogOpen(true)}
      />
      {dialogOpen && (
        <Suspense>
          <StartQuizDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            sectionId={sectionId}
            maxQuestions={questionCount}
          />
        </Suspense>
      )}
    </>
  )
}
