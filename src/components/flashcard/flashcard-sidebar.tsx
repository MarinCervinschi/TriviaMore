import { cn } from "@/lib/utils"

interface FlashcardSidebarContentProps {
  totalQuestions: number
  currentIndex: number
  studiedCards: Set<number>
  onJump: (index: number) => void
}

export function FlashcardSidebarContent({
  totalQuestions,
  currentIndex,
  studiedCards,
  onJump,
}: FlashcardSidebarContentProps) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Carte
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
              studiedCards.has(i)
                ? "bg-green-600 text-white shadow-sm dark:bg-green-700"
                : "border border-border bg-card hover:bg-muted",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md bg-green-600 dark:bg-green-700" />
          <span>Studiata</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md border border-border bg-card" />
          <span>Da studiare</span>
        </div>
      </div>
    </div>
  )
}

export function FlashcardSidebar(props: FlashcardSidebarContentProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/50 bg-muted/20 p-4 backdrop-blur-sm lg:block">
      <FlashcardSidebarContent {...props} />
    </aside>
  )
}
