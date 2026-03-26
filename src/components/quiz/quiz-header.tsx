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
        {timeLimit && (
          <QuizTimer timeLimitMinutes={timeLimit} onTimeUp={onTimeUp} />
        )}
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
