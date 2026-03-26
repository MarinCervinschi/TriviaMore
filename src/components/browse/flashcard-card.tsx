import { lazy, Suspense, useState } from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const StartFlashcardDialog = lazy(
  () =>
    import("@/components/flashcard/start-flashcard-dialog").then((m) => ({
      default: m.StartFlashcardDialog,
    })),
)

export function FlashcardCard({
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Flashcard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            {questionCount} flashcard disponibili.
          </p>
          <Button className="w-full" onClick={() => setDialogOpen(true)}>
            Inizia Flashcard
          </Button>
        </CardContent>
      </Card>
      {dialogOpen && (
        <Suspense>
          <StartFlashcardDialog
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
