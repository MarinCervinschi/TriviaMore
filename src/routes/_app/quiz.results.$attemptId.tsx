import { useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CheckCircle, Clock, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { Json } from "@/lib/supabase/database.types"
import { ReportButton } from "@/components/requests/report-button"
import { parseOptions, isCorrectOption } from "@/lib/quiz/options"
import { quizQueries } from "@/lib/quiz/queries"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent, getScoreBadgeVariant } from "@/lib/utils/quiz-results"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/quiz/results/$attemptId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      quizQueries.results(params.attemptId),
    )
    if (!data) throw notFound()
    return data
  },
  head: () => seoHead({ title: "Risultati Quiz", noindex: true }),
  component: ResultsPage,
  notFoundComponent: () => (
    <NotFoundPage message="Il risultato del quiz non è stato trovato." />
  ),
})

function ResultsPage() {
  const { attemptId } = Route.useParams()
  const { data: result } = useSuspenseQuery(quizQueries.results(attemptId))

  if (!result) return null

  const evalMode = result.quiz.evaluation_mode

  const correctCount = result.answers.filter((a) => {
    const q = result.quiz.questions.find((q) => q.id === a.question_id)
    if (!q) return false
    const userSet = new Set(a.user_answer)
    const correctSet = new Set(q.correct_answer)
    return (
      userSet.size === correctSet.size &&
      [...userSet].every((v) => correctSet.has(v))
    )
  }).length

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Score Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-orange-300/10 blur-[60px]" />

          <p className="relative mb-1 text-sm text-muted-foreground">
            {result.quiz.section.name} &bull;{" "}
            {result.quiz.section.course_name}
          </p>
          <p
            className={cn(
              "relative text-6xl font-bold sm:text-7xl",
              getGradeColor(result.score),
            )}
          >
            {formatThirtyScaleGrade(result.score)}
          </p>
          <p className="relative mt-2 text-lg text-muted-foreground">
            {getGradeDescription(result.score)}
          </p>

          <div className="relative mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-muted/50 p-4">
              <CheckCircle className="mx-auto mb-2 h-5 w-5 text-green-500" />
              <p className="text-2xl font-bold">{correctCount}</p>
              <p className="text-xs text-muted-foreground">Corrette</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <XCircle className="mx-auto mb-2 h-5 w-5 text-red-500" />
              <p className="text-2xl font-bold">
                {result.quiz.questions.length - correctCount}
              </p>
              <p className="text-xs text-muted-foreground">Errate</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <Clock className="mx-auto mb-2 h-5 w-5 text-blue-500" />
              <p className="text-2xl font-bold">
                {result.time_spent
                  ? formatTimeSpent(result.time_spent)
                  : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">Tempo</p>
            </div>
          </div>

          {/* Evaluation inline */}
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{evalMode.name}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>
              Corretta:{" "}
              <span className="font-medium text-green-600">
                +{evalMode.correct_answer_points} pt
              </span>
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>
              Errata:{" "}
              <span className="font-medium text-red-600">
                {evalMode.incorrect_answer_points} pt
              </span>
            </span>
          </div>
        </div>

        {/* Question Review */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Revisione Domande
          </h2>
          <div className="space-y-3">
            {result.quiz.questions.map((question, index) => {
              const answer = result.answers.find(
                (a) => a.question_id === question.id,
              )
              const userAnswers = answer?.user_answer ?? []
              const userAnswerSet = new Set(userAnswers)
              const correctAnswerSet = new Set(question.correct_answer)
              const isCorrect =
                userAnswerSet.size === correctAnswerSet.size &&
                [...userAnswerSet].every((v) => correctAnswerSet.has(v))

              return (
                <ReviewItem
                  key={question.id}
                  question={question}
                  userAnswerSet={userAnswerSet}
                  isCorrect={isCorrect}
                  score={answer?.score ?? 0}
                  index={index}
                />
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center pb-8">
          <Button variant="outline" size="lg" asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReviewItem({
  question,
  userAnswerSet,
  isCorrect,
  score,
  index,
}: {
  question: {
    id: string
    content: string
    options: Json | null
    correct_answer: string[]
    explanation: string | null
  }
  userAnswerSet: Set<string>
  isCorrect: boolean
  score: number
  index: number
}) {
  const [open, setOpen] = useState(false)
  const options = parseOptions(question.options)

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open) } }}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
            {index + 1}
          </span>
          <span className="line-clamp-1 text-sm font-medium">
            {question.content.slice(0, 80)}
            {question.content.length > 80 && "..."}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ReportButton questionId={question.id} questionContent={question.content} />
          <Badge variant={getScoreBadgeVariant(isCorrect ? 30 : 0)}>
            {isCorrect
              ? "Corretta"
              : userAnswerSet.size > 0
                ? "Errata"
                : "Non risposta"}{" "}
            ({score} pt)
          </Badge>
        </div>
      </div>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          <div className="text-sm">
            <MarkdownRenderer
              content={question.content}
              className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            />
          </div>
          {options.length > 0 && (
            <ul className="space-y-1.5">
              {options.map((option, optIndex) => {
                const isOptionCorrect = isCorrectOption(
                  option.id,
                  question.correct_answer,
                )
                const isSelected = userAnswerSet.has(option.id)

                let bgClass = "bg-muted/30"
                if (isOptionCorrect && isSelected)
                  bgClass =
                    "bg-green-500/10 text-green-700 dark:text-green-400"
                else if (isOptionCorrect && !isSelected)
                  bgClass =
                    "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                else if (!isOptionCorrect && isSelected)
                  bgClass =
                    "bg-red-500/10 text-red-700 dark:text-red-400"

                return (
                  <li
                    key={option.id}
                    className={`rounded-xl p-3 text-sm ${bgClass}`}
                  >
                    <span className="mr-2 font-semibold">
                      {String.fromCharCode(65 + optIndex)})
                    </span>
                    <MarkdownRenderer
                      content={option.text}
                      inline
                    />
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
            <div className="rounded-xl bg-blue-500/10 p-4">
              <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Spiegazione
              </p>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <MarkdownRenderer
                  content={question.explanation}
                  className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
