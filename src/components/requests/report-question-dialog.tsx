import { useState } from "react"
import { Flag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRequest } from "@/lib/requests/mutations"
import { cn } from "@/lib/utils"

const REASONS = [
  { id: "errata", label: "Errata", description: "La domanda o la risposta contiene un errore" },
  { id: "imprecisa", label: "Imprecisa", description: "La formulazione e ambigua o poco chiara" },
  { id: "fuori_contesto", label: "Fuori contesto", description: "La domanda non appartiene a questa sezione" },
  { id: "altro", label: "Altro", description: "Specifica nel commento" },
] as const

export function ReportQuestionDialog({
  questionId,
  questionContent,
  open,
  onOpenChange,
}: {
  questionId: string
  questionContent: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reasons, setReasons] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const hasAltro = reasons.includes("altro")
  const commentRequired = hasAltro
  const canSubmit = reasons.length > 0 && (!commentRequired || comment.trim().length > 0)

  const createRequest = useCreateRequest(() => {
    onOpenChange(false)
    setReasons([])
    setComment("")
  })

  function toggleReason(id: string) {
    setReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    )
  }

  function handleSubmit() {
    createRequest.mutate({
      type: "report",
      submitted_content: {
        type: "report",
        question_id: questionId,
        question_content: questionContent.slice(0, 500),
        reasons,
        comment: comment.trim() || null,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="size-4 text-red-500" strokeWidth={1.5} />
            Segnala domanda
          </DialogTitle>
          <DialogDescription>
            Seleziona il motivo della segnalazione.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reason checkboxes */}
          <div className="space-y-2">
            {REASONS.map((reason) => {
              const checked = reasons.includes(reason.id)
              return (
                <label
                  key={reason.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all",
                    checked ? "border-primary/30 bg-primary/5" : "border-transparent bg-muted/50 hover:bg-accent/50",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleReason(reason.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{reason.label}</p>
                    <p className="text-xs text-muted-foreground">{reason.description}</p>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Commento {commentRequired ? "(obbligatorio)" : "(opzionale)"}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Descrivi il problema..."
              rows={3}
              className={cn(
                "rounded-xl",
                commentRequired && !comment.trim() && "border-red-500/50",
              )}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createRequest.isPending}
            className="w-full rounded-xl"
          >
            {createRequest.isPending ? "Invio..." : "Invia segnalazione"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
