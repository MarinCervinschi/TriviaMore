import { useCallback, useEffect, useMemo, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { FlashcardQuestionCard } from "@/components/flashcard/flashcard-question-card"
import { FlashcardHeader } from "@/components/flashcard/flashcard-header"
import { FlashcardNavigation } from "@/components/flashcard/flashcard-navigation"
import { FlashcardProgress } from "@/components/flashcard/flashcard-progress"
import { FlashcardResults } from "@/components/flashcard/flashcard-results"
import {
  FlashcardSidebar,
  FlashcardSidebarContent,
} from "@/components/flashcard/flashcard-sidebar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { FlashcardSkeleton } from "@/components/skeletons"
import { getFlashcardSessionFn } from "@/lib/flashcard/server"
import type { FlashcardSession } from "@/lib/flashcard/types"

export const Route = createFileRoute("/flashcard/$sessionId")({
  loader: async ({ params }) => {
    return getFlashcardSessionFn({ data: { sessionId: params.sessionId } })
  },
  pendingComponent: FlashcardSkeleton,
  component: FlashcardPage,
})

function FlashcardPage() {
  const navigate = useNavigate()
  const session = Route.useLoaderData() as FlashcardSession | null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [isFlipped, setIsFlipped] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      if (!prev) {
        // Flipping to back — mark as studied
        setStudiedCards((s) => {
          const next = new Set(s)
          next.add(currentIndex)
          return next
        })
      }
      return !prev
    })
  }, [currentIndex])

  const goToCard = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      setIsFlipped(false)
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileSidebarOpen(false)
      }
    },
    [],
  )

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen((prev) => !prev)
    } else {
      setMobileSidebarOpen((prev) => !prev)
    }
  }, [])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) goToCard(currentIndex - 1)
  }, [currentIndex, goToCard])

  const handleNext = useCallback(() => {
    if (session && currentIndex < session.questions.length - 1) {
      goToCard(currentIndex + 1)
    }
  }, [currentIndex, session, goToCard])

  const handleComplete = useCallback(() => {
    setShowResults(true)
  }, [])

  const confirmExit = useCallback(() => {
    navigate({ to: "/" })
  }, [navigate])

  const handleRetry = useMemo(() => {
    if (!session) return undefined
    return () => {
      setStudiedCards(new Set())
      setCurrentIndex(0)
      setIsFlipped(false)
      setShowResults(false)
    }
  }, [session])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResults) return

      if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        handleFlip()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showResults, handleNext, handlePrevious, handleFlip])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Sessione non trovata.</p>
      </div>
    )
  }

  if (showResults) {
    return (
      <FlashcardResults
        questions={session.questions}
        studiedCards={studiedCards}
        timeSpent={Date.now() - startTime}
        sectionName={session.section.name}
        onExit={() => navigate({ to: "/" })}
        onRetry={handleRetry}
      />
    )
  }

  const currentQuestion = session.questions[currentIndex]

  return (
    <div className="flex h-dvh flex-col">
      <FlashcardHeader
        questionIndex={currentIndex}
        totalQuestions={session.questions.length}
        studiedCount={studiedCards.size}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onExit={() => setShowExitDialog(true)}
      />
      <FlashcardProgress
        studied={studiedCards.size}
        total={session.questions.length}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <FlashcardSidebar
            totalQuestions={session.questions.length}
            currentIndex={currentIndex}
            studiedCards={studiedCards}
            onJump={goToCard}
          />
        )}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 overflow-y-auto p-4 lg:hidden">
            <FlashcardSidebarContent
              totalQuestions={session.questions.length}
              currentIndex={currentIndex}
              studiedCards={studiedCards}
              onJump={goToCard}
            />
          </SheetContent>
        </Sheet>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {currentQuestion && (
            <FlashcardQuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              isFlipped={isFlipped}
              onFlip={handleFlip}
            />
          )}
        </div>
      </div>
      <FlashcardNavigation
        currentIndex={currentIndex}
        totalQuestions={session.questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
      />
      <ConfirmationDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="Esci dalla Sessione"
        description="Sei sicuro di voler uscire? I progressi della sessione verranno persi."
        confirmText="Esci"
        cancelText="Continua"
        variant="destructive"
        onConfirm={confirmExit}
      />
    </div>
  )
}
