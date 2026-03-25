import { useState } from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Bookmark, Eye, EyeOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserEmptyState } from "@/components/user/user-empty-state"
import { useToggleBookmark } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import type { UserBookmark } from "@/lib/user/types"
import type { Json } from "@/lib/supabase/database.types"

export const Route = createFileRoute("/_app/user/bookmarks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.bookmarks()),
  head: () => ({
    meta: [
      { title: "Segnalibri | TriviaMore" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookmarksPage,
})

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "HARD":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
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

function getQuestionTypeLabel(type: string) {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "Scelta multipla"
    case "TRUE_FALSE":
      return "Vero/Falso"
    case "SHORT_ANSWER":
      return "Risposta aperta"
    default:
      return type
  }
}

function getOptionsAsArray(options: Json | null): string[] {
  if (Array.isArray(options)) {
    return options.filter((item): item is string => typeof item === "string")
  }
  return []
}

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
    <div className="container space-y-8 py-8">
      <UserBreadcrumb current="Segnalibri" />

      <div>
        <h1 className="text-3xl font-bold">I Miei Segnalibri</h1>
        <p className="text-muted-foreground">
          Domande che hai salvato per ripassare più tardi
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <UserEmptyState
          icon={Bookmark}
          title="Nessun segnalibro salvato"
          description="Durante i quiz, clicca sull'icona del segnalibro per salvare le domande interessanti!"
          actionLabel="Esplora i Quiz"
          actionHref="/browse"
        />
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            {bookmarks.length} domand{bookmarks.length === 1 ? "a" : "e"}{" "}
            salvat{bookmarks.length === 1 ? "a" : "e"}
          </div>

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
        </div>
      )}
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
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
              <Badge variant="outline">
                {getQuestionTypeLabel(question.question_type)}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {question.section.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {question.section.class.name} &bull;{" "}
                {question.section.class.course.name} &bull;{" "}
                {question.section.class.course.department.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Salvato il{" "}
              {new Date(bookmark.created_at).toLocaleDateString("it-IT")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveBookmark}
              title="Rimuovi segnalibro"
            >
              <Bookmark className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">
          <MarkdownRenderer
            content={question.content}
            className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          />
        </div>

        {question.options && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Opzioni:
            </p>
            <ul className="space-y-1">
              {getOptionsAsArray(question.options).map((option, index) => (
                <li
                  key={index}
                  className={`rounded p-2 text-sm ${
                    question.correct_answer.includes(option)
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-muted/50"
                  }`}
                >
                  <span className="mr-2 font-medium">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                  {question.correct_answer.includes(option) && (
                    <span className="ml-2 text-xs font-medium">
                      &#10003; Corretta
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {question.question_type === "SHORT_ANSWER" && (
          <div className="space-y-3">
            <Button
              onClick={onToggleAnswer}
              variant={isAnswerVisible ? "secondary" : "default"}
              size="sm"
              className="w-full sm:w-auto"
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
              <div className="rounded-lg border-l-4 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
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

        {question.explanation && (
          <div className="rounded-lg border-l-4 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
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
      </CardContent>
    </Card>
  )
}
