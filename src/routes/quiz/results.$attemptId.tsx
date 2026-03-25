import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

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
import { quizQueries } from "@/lib/quiz/queries"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent, getScoreBadgeVariant } from "@/lib/utils/quiz-results"

export const Route = createFileRoute("/quiz/results/$attemptId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      quizQueries.results(params.attemptId),
    )
    if (!data) throw notFound()
    return data
  },
  head: () => ({
    meta: [
      { title: "Risultati Quiz | TriviaMore" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResultsPage,
})

function getOptionsAsArray(options: Json | null): string[] {
  if (Array.isArray(options)) {
    return options.filter((item): item is string => typeof item === "string")
  }
  return []
}

function ResultsPage() {
  const { attemptId } = Route.useParams()
  const { data: result } = useSuspenseQuery(quizQueries.results(attemptId))

  if (!result) return null

  const evalMode = result.quiz.evaluation_mode

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Score Summary */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Risultati Quiz</CardTitle>
            <CardDescription>
              {result.quiz.section.name} &bull;{" "}
              {result.quiz.section.class.course.name} &bull;{" "}
              {result.quiz.section.class.course.department.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Punteggio</p>
                <p
                  className={`text-4xl font-bold ${getGradeColor(result.score)}`}
                >
                  {formatThirtyScaleGrade(result.score)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getGradeDescription(result.score)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Risposte Corrette
                </p>
                <p className="text-4xl font-bold">
                  {result.answers.filter((a) => {
                    const q = result.quiz.questions.find(
                      (q) => q.id === a.question_id,
                    )
                    if (!q) return false
                    const userSet = new Set(a.user_answer)
                    const correctSet = new Set(q.correct_answer)
                    return (
                      userSet.size === correctSet.size &&
                      [...userSet].every((v) => correctSet.has(v))
                    )
                  }).length}
                  /{result.quiz.questions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tempo Impiegato
                </p>
                <p className="text-4xl font-bold">
                  {result.time_spent
                    ? formatTimeSpent(result.time_spent)
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Modalità di Valutazione: {evalMode.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Risposta corretta:{" "}
                </span>
                <span className="font-medium text-green-600">
                  +{evalMode.correct_answer_points} pt
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Risposta errata:{" "}
                </span>
                <span className="font-medium text-red-600">
                  {evalMode.incorrect_answer_points} pt
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Credito parziale:{" "}
                </span>
                <span className="font-medium">
                  {evalMode.partial_credit_enabled ? "Sì" : "No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Revisione Domande</h2>
          {result.quiz.questions.map((question, index) => {
            const answer = result.answers.find(
              (a) => a.question_id === question.id,
            )
            const options = getOptionsAsArray(question.options)

            const userAnswerSet = new Set(answer?.user_answer ?? [])
            const correctAnswerSet = new Set(question.correct_answer)
            const isCorrect =
              userAnswerSet.size === correctAnswerSet.size &&
              [...userAnswerSet].every((v) => correctAnswerSet.has(v))

            return (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Domanda {index + 1}
                    </span>
                    <Badge
                      variant={getScoreBadgeVariant(isCorrect ? 30 : 0)}
                    >
                      {isCorrect
                        ? "Corretta"
                        : answer && answer.user_answer.length > 0
                          ? "Errata"
                          : "Non risposta"}{" "}
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
                        const isOptionCorrect =
                          question.correct_answer.includes(option)
                        const isSelected = userAnswerSet.has(option)

                        let bgClass = "bg-muted/50"
                        if (isOptionCorrect && isSelected)
                          bgClass =
                            "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        else if (isOptionCorrect && !isSelected)
                          bgClass =
                            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        else if (!isOptionCorrect && isSelected)
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
                            {isOptionCorrect && (
                              <span className="ml-2 text-xs font-medium">
                                &#10003; Corretta
                              </span>
                            )}
                            {!isOptionCorrect && isSelected && (
                              <span className="ml-2 text-xs font-medium">
                                &#10007; Selezionata
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {question.explanation && (
                    <div className="rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                        Spiegazione:
                      </p>
                      <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        <MarkdownRenderer
                          content={question.explanation}
                          className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="outline" asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
