import { CheckCircle, Clock, Eye, Moon, Sun } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useTheme } from "@/hooks/useTheme"
import type { FlashcardQuestion } from "@/lib/flashcard/types"

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

function getCompletionMessage(percentage: number): string {
  if (percentage === 100) return "Hai studiato tutte le carte!"
  if (percentage >= 80) return "Ottimo lavoro!"
  if (percentage >= 60) return "Buon progresso!"
  if (percentage >= 40) return "Continua a studiare!"
  return "Hai ancora molto da ripassare."
}

export function FlashcardResults({
  questions,
  studiedCards,
  timeSpent,
  sectionName,
  onExit,
  onRetry,
}: {
  questions: FlashcardQuestion[]
  studiedCards: Set<number>
  timeSpent: number
  sectionName: string
  onExit: () => void
  onRetry?: () => void
}) {
  const studiedCount = studiedCards.size
  const totalCards = questions.length
  const percentage = Math.round((studiedCount / totalCards) * 100)

  return (
    <div className="min-h-screen bg-background">
      <ResultsHeader />
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Score Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-green-500/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-emerald-300/10 blur-[60px]" />

          <p className="relative mb-2 text-sm font-medium text-muted-foreground">
            {sectionName}
          </p>
          <p className="relative text-6xl font-bold text-green-600 sm:text-7xl">
            {percentage}%
          </p>
          <p className="relative mt-2 text-lg text-muted-foreground">
            {getCompletionMessage(percentage)}
          </p>

          {/* Stats row */}
          <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-2xl bg-muted/50 p-4">
              <Eye className="mx-auto mb-2 h-5 w-5 text-green-500" />
              <p className="text-2xl font-bold">
                {studiedCount}/{totalCards}
              </p>
              <p className="text-xs text-muted-foreground">Studiate</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <CheckCircle className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Completamento</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <Clock className="mx-auto mb-2 h-5 w-5 text-blue-500" />
              <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
              <p className="text-xs text-muted-foreground">Tempo</p>
            </div>
          </div>
        </div>

        {/* Card Review */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Riepilogo Carte
          </h2>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const wasStudied = studiedCards.has(index)
              return (
                <div
                  key={`${question.id}-${index}`}
                  className="overflow-hidden rounded-2xl border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="line-clamp-1 text-sm font-medium">
                        {question.content.slice(0, 80)}
                        {question.content.length > 80 && "..."}
                      </span>
                    </div>
                    <Badge
                      variant={wasStudied ? "default" : "secondary"}
                      className={
                        wasStudied
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : ""
                      }
                    >
                      {wasStudied ? "Studiata" : "Non vista"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="outline" size="lg" onClick={onExit}>
            Torna alla Home
          </Button>
          {onRetry && (
            <Button size="lg" onClick={onRetry}>
              Ricomincia
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultsHeader() {
  const { mounted, isDark, toggleTheme } = useTheme()
  return (
    <header className="flex items-center justify-between border-b border-border/50 bg-background/70 px-4 py-3 backdrop-blur-xl">
      <Logo size="sm" />
      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">Cambia tema</span>
        </Button>
      )}
    </header>
  )
}
