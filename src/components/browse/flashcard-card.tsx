import { lazy, Suspense, useState } from "react"
import { Sparkles } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

import { SessionLaunchCard } from "./session-launch-card"

const StartFlashcardDialog = lazy(
  () =>
    import("@/components/flashcard/start-flashcard-dialog").then((m) => ({
      default: m.StartFlashcardDialog,
    })),
)

export function FlashcardCard({
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
        accent="purple"
        icon={Sparkles}
        title="Flashcard"
        unitLabel="carte disponibili"
        count={questionCount}
        isAuthenticated={isAuthenticated}
        onStart={() => setDialogOpen(true)}
      />
      {dialogOpen && (
        <Suspense>
          <StartFlashcardDialog
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
