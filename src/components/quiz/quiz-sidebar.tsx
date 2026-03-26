import { cn } from "@/lib/utils"

export function QuizSidebar({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  onJump,
}: {
  totalQuestions: number
  currentIndex: number
  answeredQuestions: boolean[]
  onJump: (index: number) => void
}) {
  return (
    <div className="w-64 shrink-0 border-r border-border/50 bg-muted/20 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Domande
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
              i === currentIndex &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background",
              answeredQuestions[i]
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card hover:bg-muted",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md bg-primary" />
          <span>Risposta data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md border border-border bg-card" />
          <span>Senza risposta</span>
        </div>
      </div>
    </div>
  )
}
