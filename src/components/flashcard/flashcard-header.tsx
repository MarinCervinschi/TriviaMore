import { Eye, LogOut, PanelLeftClose, PanelLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function FlashcardHeader({
  questionIndex,
  totalQuestions,
  studiedCount,
  sidebarOpen,
  onToggleSidebar,
  onExit,
}: {
  questionIndex: number
  totalQuestions: number
  studiedCount: number
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onExit: () => void
}) {
  return (
    <header className="flex items-center justify-between border-b border-border/50 bg-background/70 px-4 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9 rounded-xl"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
        <span className="rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          {questionIndex + 1}
          <span className="text-muted-foreground"> / {totalQuestions}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="secondary"
          className="gap-1.5 rounded-xl px-3 py-1"
        >
          <Eye className="h-3.5 w-3.5" />
          {studiedCount}/{totalQuestions}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Esci
        </Button>
      </div>
    </header>
  )
}
