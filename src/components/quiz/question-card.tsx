import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { QuizQuestion } from "@/lib/quiz/types"
import { parseOptions } from "@/lib/quiz/options"
import { BookmarkButton } from "./bookmark-button"

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

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
  isGuest = false,
}: {
  question: QuizQuestion
  questionNumber: number
  selectedAnswers: string[]
  onAnswerChange: (answers: string[]) => void
  isGuest?: boolean
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
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Domanda {questionNumber}
            </span>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {getDifficultyLabel(question.difficulty)}
            </Badge>
          </div>
          <BookmarkButton questionId={question.id} isGuest={isGuest} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg">
          <MarkdownRenderer
            content={question.content}
            className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          />
        </div>

        {question.question_type === "TRUE_FALSE" ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "true", text: "Vero" },
              { id: "false", text: "Falso" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option.id)}
                className={`rounded-lg border-2 p-4 text-center text-lg font-medium transition-colors ${
                  selectedAnswers.includes(option.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
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
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
                  selectedAnswers.includes(option.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={selectedAnswers.includes(option.id)}
                  onCheckedChange={() => handleOptionToggle(option.id)}
                  className="mt-0.5"
                />
                <span className="flex-1">
                  <span className="mr-2 font-medium text-muted-foreground">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
