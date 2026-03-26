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
    <header className="flex items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Carta {questionIndex + 1} di {totalQuestions}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <Eye className="h-3 w-3" />
          {studiedCount}/{totalQuestions}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Esci
        </Button>
      </div>
    </header>
  )
}
