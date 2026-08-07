import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { BookmarkButton } from "@/components/quiz/bookmark-button"
import { ReportButton } from "@/components/requests/report-button"
import { QuestionHeader } from "@/components/quiz/question-header"
import type { FlashcardQuestion } from "@/lib/flashcard/types"

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
        <div className="max-h-[80vh] min-h-[400px] overflow-y-auto wrap-anywhere rounded-2xl border bg-card p-6 shadow-sm [backface-visibility:hidden] sm:p-8">
          <QuestionHeader
            number={questionNumber}
            difficulty={question.difficulty}
            className="pb-6"
            actions={
              <>
                <BookmarkButton questionId={question.id} />
                <ReportButton
                  questionId={question.id}
                  questionContent={question.content}
                />
                <span className="text-xs text-muted-foreground">
                  Clicca per girare
                </span>
              </>
            }
          />
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
        <div className="absolute inset-0 max-h-[80vh] min-h-[400px] overflow-y-auto wrap-anywhere rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
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
          <div className="flex min-h-[280px] flex-col gap-6 [justify-content:safe_center]">
            {question.correctAnswer.length === 1 ? (
              <MarkdownRenderer
                content={question.correctAnswer[0]}
                className="text-center [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />
            ) : (
              <MarkdownRenderer
                content={question.correctAnswer
                  .map((a, i) => `**Variante ${i + 1}.** ${a}`)
                  .join("\n\n")}
                className="text-center [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              />
            )}
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
