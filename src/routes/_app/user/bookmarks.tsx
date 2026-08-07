import { useState } from "react"

import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Bookmark, ChevronDown } from "lucide-react"

import { BookmarksSkeleton } from "@/components/skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { ReportButton } from "@/components/requests/report-button"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { EmptyState } from "@/components/ui/empty-state"
import { UserHero } from "@/components/user/user-hero"
import { useToggleBookmark } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import type { UserBookmark } from "@/lib/user/types"
import {
  getDifficultyColor,
  getDifficultyLabel,
  getQuestionTypeLabel,
} from "@/lib/user/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import { parseOptions, isCorrectOption } from "@/lib/quiz/options"

export const Route = createFileRoute("/_app/user/bookmarks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.bookmarks()),
  head: () => seoHead({ title: "Segnalibri", noindex: true }),
  pendingComponent: BookmarksSkeleton,
  component: BookmarksPage,
})

function BookmarksPage() {
  const { data: bookmarks } = useSuspenseQuery(userQueries.bookmarks())
  const toggleBookmark = useToggleBookmark()
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

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
          <EmptyState
            icon={Bookmark}
            title="Nessun segnalibro salvato"
            description="Durante i quiz, clicca sull'icona del segnalibro per salvare le domande interessanti!"
            actionLabel="Esplora i Quiz"
            actionHref="/browse"
          />
        ) : (
          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {bookmarks.map((bookmark) => (
              <motion.div key={bookmark.questionId} variants={item}>
                <BookmarkCard
                  bookmark={bookmark}
                  onRemoveBookmark={() =>
                    toggleBookmark.mutate(bookmark.questionId)
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BookmarkCard({
  bookmark,
  onRemoveBookmark,
}: {
  bookmark: UserBookmark
  onRemoveBookmark: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-md">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={`min-w-0 flex-1 text-sm font-medium ${open ? "" : "line-clamp-1"}`}>
            <MarkdownRenderer content={bookmark.content} inline />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            className={`rounded-full ${getDifficultyColor(bookmark.difficulty)}`}
          >
            {getDifficultyLabel(bookmark.difficulty)}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {getQuestionTypeLabel(bookmark.questionType)}
          </Badge>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                {bookmark.sectionName}
              </span>
              <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                {bookmark.className}
              </span>
              <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                {bookmark.courseName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Salvato il{" "}
                {new Date(bookmark.createdAt).toLocaleDateString("it-IT")}
              </span>
              <ReportButton
                questionId={bookmark.questionId}
                questionContent={bookmark.content}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveBookmark()
                }}
                title="Rimuovi segnalibro"
                className="rounded-xl"
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>

          {/* Options */}
          {bookmark.options && (
            <ul className="space-y-1.5">
              {parseOptions(bookmark.options).map((option, index) => (
                <li
                  key={option.id}
                  className={`rounded-xl p-3 text-sm ${
                    isCorrectOption(option.id, bookmark.correctAnswer)
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-muted/30"
                  }`}
                >
                  <span className="mr-2 font-semibold">
                    {String.fromCharCode(65 + index)})
                  </span>
                  <MarkdownRenderer
                    content={option.text}
                    inline
                  />
                  {isCorrectOption(option.id, bookmark.correctAnswer) && (
                    <span className="ml-2 text-xs font-medium">
                      &#10003; Corretta
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Short answer */}
          {bookmark.questionType === "SHORT_ANSWER" && (
            <div className="rounded-xl bg-green-500/10 p-4">
              <p className="mb-1 text-xs font-semibold text-green-600 dark:text-green-400">
                Risposta corretta
              </p>
              <div className="text-sm text-green-700 dark:text-green-300">
                <MarkdownRenderer
                  content={
                    bookmark.correctAnswer[0] ??
                    "Nessuna risposta disponibile"
                  }
                  className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                />
              </div>
            </div>
          )}

          {/* Explanation */}
          {bookmark.explanation && (
            <div className="rounded-xl bg-blue-500/10 p-4">
              <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Spiegazione
              </p>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <MarkdownRenderer
                  content={bookmark.explanation}
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
