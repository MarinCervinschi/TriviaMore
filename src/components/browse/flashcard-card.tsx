import { lazy, Suspense, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowRight, LogIn, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

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
      <div className="rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-card to-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="inline-flex shrink-0 rounded-xl bg-purple-500/10 p-2.5">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight">Flashcard</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {questionCount}
              </span>{" "}
              carte disponibili
            </p>
          </div>
          {isAuthenticated ? (
            <Button
              size="sm"
              className="shrink-0 shadow-sm"
              onClick={() => setDialogOpen(true)}
            >
              Inizia
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="shrink-0 shadow-sm" asChild>
              <Link to="/auth/register">
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Registrati
              </Link>
            </Button>
          )}
        </div>
      </div>
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
