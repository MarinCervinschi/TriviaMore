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
    <div className="flex items-center justify-between border-t border-border/50 bg-background/70 px-4 py-3 backdrop-blur-xl">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst}
        className="rounded-xl"
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" />
        Precedente
      </Button>

      <Button
        onClick={onComplete}
        variant="default"
        className="rounded-xl shadow-sm"
      >
        <CheckCircle className="mr-1.5 h-4 w-4" />
        Termina
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={isLast}
        className="rounded-xl"
      >
        Successiva
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  )
}
