import { useState } from "react"

import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Bookmark, Eye, EyeOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserEmptyState } from "@/components/user/user-empty-state"
import { UserHero } from "@/components/user/user-hero"
import { useToggleBookmark } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import type { UserBookmark } from "@/lib/user/types"
import {
  getDifficultyColor,
  getDifficultyLabel,
  getQuestionTypeLabel,
} from "@/lib/user/utils"
import { parseOptions, isCorrectOption } from "@/lib/quiz/options"

export const Route = createFileRoute("/_app/user/bookmarks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.bookmarks()),
  head: () => seoHead({ title: "Segnalibri", noindex: true }),
  component: BookmarksPage,
})

function BookmarksPage() {
  const { data: bookmarks } = useSuspenseQuery(userQueries.bookmarks())
  const toggleBookmark = useToggleBookmark()
  const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set())

  const toggleAnswerVisibility = (questionId: string) => {
    setVisibleAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={Bookmark}
        title="I Miei Segnalibri"
        description="Domande che hai salvato per ripassare piu tardi"
        stats={
          bookmarks.length > 0
            ? [{ label: "domande salvate", value: bookmarks.length }]
            : undefined
        }
      />

      <div className="container space-y-6">
        <UserBreadcrumb current="Segnalibri" />

        {bookmarks.length === 0 ? (
          <UserEmptyState
            icon={Bookmark}
            title="Nessun segnalibro salvato"
            description="Durante i quiz, clicca sull'icona del segnalibro per salvare le domande interessanti!"
            actionLabel="Esplora i Quiz"
            actionHref="/browse"
          />
        ) : (
          <div className="grid gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.question_id}
                bookmark={bookmark}
                isAnswerVisible={visibleAnswers.has(bookmark.question_id)}
                onToggleAnswer={() =>
                  toggleAnswerVisibility(bookmark.question_id)
                }
                onRemoveBookmark={() =>
                  toggleBookmark.mutate(bookmark.question_id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookmarkCard({
  bookmark,
  isAnswerVisible,
  onToggleAnswer,
  onRemoveBookmark,
}: {
  bookmark: UserBookmark
  isAnswerVisible: boolean
  onToggleAnswer: () => void
  onRemoveBookmark: () => void
}) {
  const { question } = bookmark

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl">
      {/* Gradient top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-400" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={`rounded-full ${getDifficultyColor(question.difficulty)}`}
              >
                {getDifficultyLabel(question.difficulty)}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {getQuestionTypeLabel(question.question_type)}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {question.section.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {question.section.class.name}
                </span>
                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {question.section.class.course.name}
                </span>
                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {question.section.class.course.department.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Salvato il{" "}
              {new Date(bookmark.created_at).toLocaleDateString("it-IT")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveBookmark}
              title="Rimuovi segnalibro"
              className="rounded-xl"
            >
              <Bookmark className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>

        {/* Question content */}
        <div className="mb-4 text-lg font-medium">
          <MarkdownRenderer
            content={question.content}
            className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          />
        </div>

        {/* Options */}
        {question.options && (
          <div className="mb-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Opzioni:
            </p>
            <ul className="space-y-2">
              {parseOptions(question.options).map((option, index) => (
                <li
                  key={option.id}
                  className={`rounded-xl p-3 text-sm ${
                    isCorrectOption(option.id, question.correct_answer)
                      ? "border-l-4 border-green-500 bg-green-500/5 dark:bg-green-900/20"
                      : "bg-muted/30"
                  }`}
                >
                  <span className="mr-2 font-medium">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option.text}
                  {isCorrectOption(option.id, question.correct_answer) && (
                    <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                      &#10003; Corretta
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Short answer */}
        {question.question_type === "SHORT_ANSWER" && (
          <div className="mb-4 space-y-3">
            <Button
              onClick={onToggleAnswer}
              variant={isAnswerVisible ? "secondary" : "default"}
              size="sm"
              className="w-full rounded-xl sm:w-auto"
            >
              {isAnswerVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Nascondi risposta
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Mostra risposta
                </>
              )}
            </Button>

            {isAnswerVisible && (
              <div className="rounded-xl border-l-4 border-green-400 bg-green-500/5 p-4 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Risposta corretta:
                </p>
                <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                  <MarkdownRenderer
                    content={
                      question.correct_answer[0] ??
                      "Nessuna risposta disponibile"
                    }
                    className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="rounded-xl border-l-4 border-blue-400 bg-blue-500/5 p-4 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
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
      </div>
    </div>
  )
}
