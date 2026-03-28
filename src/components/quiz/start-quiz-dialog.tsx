import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Info, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { quizQueries } from "@/lib/quiz/queries"
import { useStartQuiz } from "@/lib/quiz/mutations"
import type { EvaluationMode } from "@/lib/quiz/types"

const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120]

export function StartQuizDialog({
  open,
  onOpenChange,
  sectionId,
  maxQuestions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  maxQuestions: number
}) {
  const [questionCount, setQuestionCount] = useState(
    Math.min(30, maxQuestions),
  )
  const [timeStepIndex, setTimeStepIndex] = useState(
    TIME_STEPS.indexOf(30),
  )
  const [evalModeId, setEvalModeId] = useState<string | undefined>()

  const { data: evalModes } = useQuery({
    ...quizQueries.evaluationModes(),
    enabled: open,
  })

  const selectedEvalMode = evalModes?.find(
    (m) => m.id === (evalModeId ?? evalModes?.[0]?.id),
  )

  const mutation = useStartQuiz(() => onOpenChange(false))

  const handleStart = () => {
    const time = TIME_STEPS[timeStepIndex]
    mutation.mutate({
      sectionId,
      questionCount: Math.min(questionCount, maxQuestions),
      timeLimit: time === undefined ? null : time,
      quizMode: "STUDY",
      evaluationModeId: evalModeId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Quiz</DialogTitle>
          <DialogDescription>
            Scegli le impostazioni per il tuo quiz
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Numero di domande</Label>
              <span className="text-sm font-medium tabular-nums">
                {questionCount === maxQuestions
                  ? `Tutte (${questionCount})`
                  : questionCount}
              </span>
            </div>
            <Slider
              value={[questionCount]}
              onValueChange={([v]) => setQuestionCount(v)}
              min={1}
              max={maxQuestions}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tempo limite</Label>
              <span className="text-sm font-medium tabular-nums">
                {timeStepIndex >= TIME_STEPS.length
                  ? "Illimitato"
                  : `${TIME_STEPS[timeStepIndex]} min`}
              </span>
            </div>
            <Slider
              value={[timeStepIndex]}
              onValueChange={([v]) => setTimeStepIndex(v)}
              min={0}
              max={TIME_STEPS.length}
              step={1}
            />
          </div>

          {evalModes && evalModes.length > 1 && (
            <div className="space-y-2">
              <Label>Valutazione</Label>
              <Select
                value={evalModeId ?? evalModes[0]?.id}
                onValueChange={setEvalModeId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {evalModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvalMode && (
                <EvalModeInfo mode={selectedEvalMode} />
              )}
            </div>
          )}

          {evalModes && evalModes.length === 1 && evalModes[0] && (
            <EvalModeInfo mode={evalModes[0]} />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Annulla
          </Button>
          <Button onClick={handleStart} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inizia Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EvalModeInfo({ mode }: { mode: EvaluationMode }) {
  return (
    <div className="flex gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="space-y-0.5">
        {mode.description && <p>{mode.description}</p>}
        <p>
          Corretta: <span className="font-medium text-foreground">+{mode.correct_answer_points}</span>
          {" · "}Errata: <span className="font-medium text-foreground">{mode.incorrect_answer_points}</span>
          {mode.partial_credit_enabled && " · Credito parziale attivo"}
        </p>
      </div>
    </div>
  )
}
