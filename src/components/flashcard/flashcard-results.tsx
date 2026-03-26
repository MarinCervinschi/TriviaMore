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
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Summary */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Sessione Completata</CardTitle>
            <CardDescription>{sectionName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Carte Studiate</p>
                <p className="text-4xl font-bold text-primary">
                  {studiedCount}/{totalCards}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completamento</p>
                <p className="text-4xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">
                  {getCompletionMessage(percentage)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo</p>
                <p className="text-4xl font-bold">{formatTime(timeSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Riepilogo Carte</h2>
          {questions.map((question, index) => {
            const wasStudied = studiedCards.has(index)
            return (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Carta {index + 1}
                    </span>
                    <Badge variant={wasStudied ? "default" : "secondary"}>
                      {wasStudied ? "Studiata" : "Non vista"}
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
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="font-medium text-primary">Risposta: </span>
                    {question.correct_answer.join(" / ")}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="outline" onClick={onExit}>
            Torna alla Sezione
          </Button>
          {onRetry && <Button onClick={onRetry}>Ricomincia</Button>}
        </div>
      </div>
    </div>
  )
}
