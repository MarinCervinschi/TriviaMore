import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { BookmarkButton } from "@/components/quiz/bookmark-button"
import { ReportButton } from "@/components/requests/report-button"
import type { FlashcardQuestion } from "@/lib/flashcard/types"

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    case "HARD":
      return "bg-red-500/10 text-red-600 border-red-500/20"
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
        <div className="min-h-[400px] overflow-hidden rounded-2xl border bg-card p-6 shadow-sm [backface-visibility:hidden] sm:p-8">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold gradient-text">
                {questionNumber}
              </span>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <BookmarkButton questionId={question.id} />
              <ReportButton
                questionId={question.id}
                questionContent={question.content}
              />
              <span className="text-xs text-muted-foreground">
                Clicca per girare
              </span>
            </div>
          </div>
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="text-lg leading-relaxed">
              <MarkdownRenderer
                content={question.content}
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 min-h-[400px] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
          <div className="flex items-center justify-between pb-6">
            <span className="text-sm font-medium text-primary">
              Risposta
            </span>
            <div className="flex items-center gap-1">
              <BookmarkButton questionId={question.id} />
              <ReportButton
                questionId={question.id}
                questionContent={question.content}
              />
              <span className="text-xs text-muted-foreground">
                Clicca per girare
              </span>
            </div>
          </div>
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-6">
            <div className="text-lg font-medium">
              <MarkdownRenderer
                content={question.correct_answer.join(" / ")}
                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />
            </div>
            {question.explanation && (
              <div className="w-full rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                <MarkdownRenderer
                  content={question.explanation}
                  className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
