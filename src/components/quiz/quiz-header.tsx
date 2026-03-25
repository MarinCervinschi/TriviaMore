import { LogOut, PanelLeftClose, PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

import { QuizTimer } from "./quiz-timer"

export function QuizHeader({
  questionIndex,
  totalQuestions,
  timeLimit,
  sidebarOpen,
  onToggleSidebar,
  onTimeUp,
  onExit,
}: {
  questionIndex: number
  totalQuestions: number
  timeLimit: number | null
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onTimeUp: () => void
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
          Domanda {questionIndex + 1} di {totalQuestions}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {timeLimit && (
          <QuizTimer timeLimitMinutes={timeLimit} onTimeUp={onTimeUp} />
        )}
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
