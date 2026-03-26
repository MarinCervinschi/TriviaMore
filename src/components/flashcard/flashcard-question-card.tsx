import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { FlashcardQuestion } from "@/lib/flashcard/types"

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "HARD":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return ""
  }
}

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "Facile"
    case "MEDIUM":
      return "Medio"
    case "HARD":
      return "Difficile"
    default:
      return difficulty
  }
}

export function FlashcardQuestionCard({
  question,
  questionNumber,
  isFlipped,
  onFlip,
}: {
  question: FlashcardQuestion
  questionNumber: number
  isFlipped: boolean
  onFlip: () => void
}) {
  return (
    <div
      className="mx-auto max-w-3xl cursor-pointer [perspective:1000px]"
      onClick={onFlip}
    >
      <div
        className={`relative transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <Card className="min-h-[300px] p-6 [backface-visibility:hidden]">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Carta {questionNumber}
              </span>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Clicca per girare
            </span>
          </div>
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-lg">
              <MarkdownRenderer
                content={question.content}
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />
            </div>
          </div>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 min-h-[300px] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center justify-between pb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Risposta
            </span>
            <span className="text-xs text-muted-foreground">
              Clicca per girare
            </span>
          </div>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
            <div className="text-lg font-medium text-primary">
              <MarkdownRenderer
                content={question.correct_answer.join(" / ")}
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />
            </div>
            {question.explanation && (
              <div className="w-full rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <MarkdownRenderer
                  content={question.explanation}
                  className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
