import { CheckCircle, Clock, Target, XCircle } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { QuizResults } from "@/lib/quiz/types"
import { parseOptions, isCorrectOption } from "@/lib/quiz/options"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent, getScoreBadgeVariant } from "@/lib/utils/quiz-results"
import { cn } from "@/lib/utils"

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
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Score Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-orange-300/10 blur-[60px]" />

          <p className="relative mb-2 text-sm font-medium text-muted-foreground">
            {results.quizTitle}
          </p>
          <p
            className={cn(
              "relative text-6xl font-bold sm:text-7xl",
              getGradeColor(results.totalScore),
            )}
          >
            {formatThirtyScaleGrade(results.totalScore)}
          </p>
          <p className="relative mt-2 text-lg text-muted-foreground">
            {getGradeDescription(results.totalScore)}
          </p>

          {/* Stats row */}
          <div className="relative mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-muted/50 p-4">
              <CheckCircle className="mx-auto mb-2 h-5 w-5 text-green-500" />
              <p className="text-2xl font-bold">{results.correctAnswers}</p>
              <p className="text-xs text-muted-foreground">Corrette</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <XCircle className="mx-auto mb-2 h-5 w-5 text-red-500" />
              <p className="text-2xl font-bold">
                {results.totalQuestions - results.correctAnswers}
              </p>
              <p className="text-xs text-muted-foreground">Errate</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <Clock className="mx-auto mb-2 h-5 w-5 text-blue-500" />
              <p className="text-2xl font-bold">
                {formatTimeSpent(results.timeSpent)}
              </p>
              <p className="text-xs text-muted-foreground">Tempo</p>
            </div>
          </div>

          {/* Evaluation mode inline */}
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>
              Corretta:{" "}
              <span className="font-medium text-green-600">
                +{results.evaluationMode.correct_answer_points} pt
              </span>
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>
              Errata:{" "}
              <span className="font-medium text-red-600">
                {results.evaluationMode.incorrect_answer_points} pt
              </span>
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>
              Credito parziale:{" "}
              <span className="font-medium">
                {results.evaluationMode.partial_credit_enabled ? "Si'" : "No"}
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
            {results.questions.map((question, index) => (
              <QuestionReviewItem
                key={question.id}
                question={question}
                answer={results.answers.find(
                  (a) => a.questionId === question.id,
                )}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="outline" size="lg" onClick={onExit}>
            Torna alla Home
          </Button>
          {onRetry && (
            <Button size="lg" onClick={onRetry}>
              Riprova
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionReviewItem({
  question,
  answer,
  index,
}: {
  question: QuizResults["questions"][number]
  answer?: QuizResults["answers"][number]
  index: number
}) {
  const [open, setOpen] = useState(false)
  const options = parseOptions(question.options)

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
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
        <Badge variant={getScoreBadgeVariant(answer?.isCorrect ? 30 : 0)}>
          {answer?.isCorrect
            ? "Corretta"
            : answer && answer.answer.length > 0
              ? "Errata"
              : "Non risposta"}
        </Badge>
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3">
          <div className="mb-3 text-sm">
            <MarkdownRenderer
              content={question.content}
              className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            />
          </div>
          {options.length > 0 && (
            <ul className="space-y-1.5">
              {options.map((option, optIndex) => {
                const isCorrect = isCorrectOption(
                  option.id,
                  question.correctAnswer,
                )
                const isSelected =
                  answer?.answer.includes(option.id) ?? false

                let bgClass = "bg-muted/30"
                if (isCorrect && isSelected)
                  bgClass =
                    "bg-green-500/10 text-green-700 dark:text-green-400"
                else if (isCorrect && !isSelected)
                  bgClass =
                    "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                else if (!isCorrect && isSelected)
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
                    {option.text}
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
        </div>
      )}
    </div>
  )
}
