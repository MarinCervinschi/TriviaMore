import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FlashcardNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onComplete,
}: {
  currentIndex: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}) {
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalQuestions - 1

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/50 bg-background/70 px-3 py-3 backdrop-blur-xl sm:px-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst}
        className="rounded-xl text-sm sm:text-base"
      >
        <ChevronLeft className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Precedente</span>
      </Button>

      <Button
        onClick={onComplete}
        variant="default"
        className="rounded-xl text-sm shadow-sm sm:text-base"
      >
        <CheckCircle className="mr-1.5 h-4 w-4" />
        Termina
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={isLast}
        className="rounded-xl text-sm sm:text-base"
      >
        <span className="hidden sm:inline">Successiva</span>
        <ChevronRight className="h-4 w-4 sm:ml-1.5" />
      </Button>
    </div>
  )
}
