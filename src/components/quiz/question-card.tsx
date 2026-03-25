import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { Json } from "@/lib/supabase/database.types"
import type { QuizQuestion } from "@/lib/quiz/types"

function getOptionsAsArray(options: Json | null): string[] {
  if (Array.isArray(options)) {
    return options.filter((item): item is string => typeof item === "string")
  }
  return []
}

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
}: {
  question: QuizQuestion
  questionNumber: number
  selectedAnswers: string[]
  onAnswerChange: (answers: string[]) => void
}) {
  const options = getOptionsAsArray(question.options)

  const handleOptionToggle = (option: string) => {
    if (question.question_type === "TRUE_FALSE") {
      // Single selection for true/false
      if (selectedAnswers.includes(option)) {
        onAnswerChange([])
      } else {
        onAnswerChange([option])
      }
    } else {
      // Multi selection for multiple choice
      if (selectedAnswers.includes(option)) {
        onAnswerChange(selectedAnswers.filter((a) => a !== option))
      } else {
        onAnswerChange([...selectedAnswers, option])
      }
    }
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Domanda {questionNumber}
          </span>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {getDifficultyLabel(question.difficulty)}
          </Badge>
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
            {["Vero", "Falso"].map((option) => (
              <button
                key={option}
                onClick={() => handleOptionToggle(option)}
                className={`rounded-lg border-2 p-4 text-center text-lg font-medium transition-colors ${
                  selectedAnswers.includes(option)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option, index) => (
              <label
                key={index}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
                  selectedAnswers.includes(option)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={selectedAnswers.includes(option)}
                  onCheckedChange={() => handleOptionToggle(option)}
                  className="mt-0.5"
                />
                <span className="flex-1">
                  <span className="mr-2 font-medium text-muted-foreground">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                </span>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
