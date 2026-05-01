import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function QuizNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onComplete,
  isCompleting = false,
}: {
  currentIndex: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  isCompleting?: boolean
}) {
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalQuestions - 1

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/50 bg-background/70 px-3 py-3 backdrop-blur-xl sm:px-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst || isCompleting}
        className="rounded-xl text-sm sm:text-base"
      >
        <ChevronLeft className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Precedente</span>
      </Button>

      <Button
        onClick={onComplete}
        variant="default"
        disabled={isCompleting}
        aria-busy={isCompleting}
        className="rounded-xl text-sm shadow-sm transition-all sm:text-base"
      >
        {isCompleting ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Completamento...</span>
            <span className="sm:hidden">Attendi</span>
          </>
        ) : (
          <>
            <CheckCircle className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Completa Quiz</span>
            <span className="sm:hidden">Completa</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={isLast || isCompleting}
        className="rounded-xl text-sm sm:text-base"
      >
        <span className="hidden sm:inline">Successiva</span>
        <ChevronRight className="h-4 w-4 sm:ml-1.5" />
      </Button>
    </div>
  )
}
