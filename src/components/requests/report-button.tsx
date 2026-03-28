import { useState } from "react"
import { Flag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ReportQuestionDialog } from "./report-question-dialog"
import { cn } from "@/lib/utils"

export function ReportButton({
  questionId,
  questionContent,
  className,
}: {
  questionId: string
  questionContent: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(true)
              }}
              className={cn("h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500", className)}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Segnala domanda</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ReportQuestionDialog
        questionId={questionId}
        questionContent={questionContent}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
