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
      <div className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card to-card p-6 transition-all duration-300 hover:shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-[40px]" />

        <div className="relative">
          <div className="mb-4 inline-flex rounded-2xl bg-purple-500/10 p-3">
            <Sparkles
              className="h-7 w-7 text-purple-600"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="mb-2 text-xl font-semibold tracking-tight">
            Flashcard
          </h3>
          <p className="mb-6 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {questionCount}
            </span>{" "}
            flashcard disponibili. Memorizza i concetti chiave.
          </p>
          {isAuthenticated ? (
            <Button
              className="w-full shadow-sm"
              onClick={() => setDialogOpen(true)}
            >
              Inizia Flashcard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="w-full shadow-sm" asChild>
              <Link to="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Accedi per iniziare
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
