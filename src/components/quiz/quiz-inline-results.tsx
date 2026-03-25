import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { Json } from "@/lib/supabase/database.types"
import type { QuizResults } from "@/lib/quiz/types"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent, getScoreBadgeVariant } from "@/lib/utils/quiz-results"

function getOptionsAsArray(options: Json | null): string[] {
  if (Array.isArray(options)) {
    return options.filter((item): item is string => typeof item === "string")
  }
  return []
}

export function QuizInlineResults({
  results,
  onExit,
  onRetry,
}: {
  results: QuizResults
  onExit: () => void
  onRetry?: () => void
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Score Summary */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Risultati Quiz</CardTitle>
            <CardDescription>{results.quizTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Punteggio</p>
                <p
                  className={`text-4xl font-bold ${getGradeColor(results.totalScore)}`}
                >
                  {formatThirtyScaleGrade(results.totalScore)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getGradeDescription(results.totalScore)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Risposte Corrette
                </p>
                <p className="text-4xl font-bold">
                  {results.correctAnswers}/{results.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tempo Impiegato
                </p>
                <p className="text-4xl font-bold">
                  {formatTimeSpent(results.timeSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Mode Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modalità di Valutazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Risposta corretta:{" "}
                </span>
                <span className="font-medium text-green-600">
                  +{results.evaluationMode.correct_answer_points} pt
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Risposta errata:{" "}
                </span>
                <span className="font-medium text-red-600">
                  {results.evaluationMode.incorrect_answer_points} pt
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Credito parziale:{" "}
                </span>
                <span className="font-medium">
                  {results.evaluationMode.partial_credit_enabled
                    ? "Sì"
                    : "No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Revisione Domande</h2>
          {results.questions.map((question, index) => {
            const answer = results.answers.find(
              (a) => a.questionId === question.id,
            )
            const options = getOptionsAsArray(question.options)

            return (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Domanda {index + 1}
                    </span>
                    <Badge variant={getScoreBadgeVariant(answer?.score ? (answer.isCorrect ? 30 : 0) : 0)}>
                      {answer?.isCorrect
                        ? "Corretta"
                        : answer && answer.answer.length > 0
                          ? "Errata"
                          : "Non risposta"}
                      {" "}
                      ({answer?.score ?? 0} pt)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="font-medium">
                    <MarkdownRenderer
                      content={question.content}
                      className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    />
                  </div>
                  {options.length > 0 && (
                    <ul className="space-y-1">
                      {options.map((option, optIndex) => {
                        const isCorrect =
                          question.correctAnswer.includes(option)
                        const isSelected =
                          answer?.answer.includes(option) ?? false

                        let bgClass = "bg-muted/50"
                        if (isCorrect && isSelected)
                          bgClass =
                            "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        else if (isCorrect && !isSelected)
                          bgClass =
                            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        else if (!isCorrect && isSelected)
                          bgClass =
                            "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"

                        return (
                          <li
                            key={optIndex}
                            className={`rounded p-2 text-sm ${bgClass}`}
                          >
                            <span className="mr-2 font-medium">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            {option}
                            {isCorrect && (
                              <span className="ml-2 text-xs font-medium">
                                &#10003; Corretta
                              </span>
                            )}
                            {!isCorrect && isSelected && (
                              <span className="ml-2 text-xs font-medium">
                                &#10007; Selezionata
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="outline" onClick={onExit}>
            Torna alla Home
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>Riprova</Button>
          )}
        </div>
      </div>
    </div>
  )
}
