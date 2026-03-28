import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { QuizQuestion } from "@/lib/quiz/types"
import { parseOptions } from "@/lib/quiz/options"
import { ReportButton } from "@/components/requests/report-button"
import { BookmarkButton } from "./bookmark-button"

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

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
}: {
  question: QuizQuestion
  questionNumber: number
  selectedAnswers: string[]
  onAnswerChange: (answers: string[]) => void
}) {
  const options = parseOptions(question.options)

  const handleOptionToggle = (optionId: string) => {
    if (question.question_type === "TRUE_FALSE") {
      if (selectedAnswers.includes(optionId)) {
        onAnswerChange([])
      } else {
        onAnswerChange([optionId])
      }
    } else {
      if (selectedAnswers.includes(optionId)) {
        onAnswerChange(selectedAnswers.filter((a) => a !== optionId))
      } else {
        onAnswerChange([...selectedAnswers, optionId])
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold gradient-text">
            {questionNumber}
          </span>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {getDifficultyLabel(question.difficulty)}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <ReportButton questionId={question.id} questionContent={question.content} />
          <BookmarkButton questionId={question.id} />
        </div>
      </div>

      {/* Question content */}
      <div className="mb-8 rounded-2xl border bg-card p-6">
        <div className="text-lg leading-relaxed">
          <MarkdownRenderer
            content={question.content}
            className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          />
        </div>
      </div>

      {/* Options */}
      {question.question_type === "TRUE_FALSE" ? (
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "true", text: "Vero" },
            { id: "false", text: "Falso" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className={`rounded-2xl border-2 p-5 text-center text-lg font-semibold transition-all duration-200 ${
                selectedAnswers.includes(option.id)
                  ? "scale-[1.02] border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option, index) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-200 ${
                selectedAnswers.includes(option.id)
                  ? "scale-[1.01] border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <Checkbox
                checked={selectedAnswers.includes(option.id)}
                onCheckedChange={() => handleOptionToggle(option.id)}
                className="mt-0.5"
              />
              <span className="flex-1">
                <span className="mr-2 font-semibold text-muted-foreground">
                  {String.fromCharCode(65 + index)})
                </span>
                {option.text}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
