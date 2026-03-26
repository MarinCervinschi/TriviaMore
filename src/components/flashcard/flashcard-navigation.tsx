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
    <div className="flex items-center justify-between border-t bg-background px-4 py-3">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst}
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" />
        Precedente
      </Button>

      <Button onClick={onComplete} variant="default">
        <CheckCircle className="mr-1.5 h-4 w-4" />
        Termina
      </Button>

      <Button variant="outline" onClick={onNext} disabled={isLast}>
        Successiva
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  )
}
