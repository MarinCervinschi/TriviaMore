import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AnimatedBlock,
  AnimatedStack,
} from "@/components/session-config/animated-block"
import {
  EvalInfoCard,
  EvalSelect,
  SliderWithInput,
  TimeTickRow,
} from "@/components/session-config/session-form-blocks"
import { SummaryPanel } from "@/components/session-config/summary-panel"
import {
  EvalBlock,
  MetricBlock,
  TimeBlock,
} from "@/components/session-config/summary-blocks"
import { TIME_STEPS } from "@/lib/quiz/constants"
import { useStartQuiz } from "@/lib/quiz/mutations"
import { quizQueries } from "@/lib/quiz/queries"

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
    Math.min(11, maxQuestions),
  )
  const [timeStepIndex, setTimeStepIndex] = useState(TIME_STEPS.indexOf(30))
  const [evalModeId, setEvalModeId] = useState<string | undefined>()

  const { data: evalModes } = useQuery({
    ...quizQueries.evaluationModes(),
    enabled: open,
  })

  const selectedEvalMode = evalModes?.find(
    (m) => m.id === (evalModeId ?? evalModes?.[0]?.id),
  )

  const mutation = useStartQuiz(() => onOpenChange(false))

  const isUnlimited = timeStepIndex >= TIME_STEPS.length
  const timeLimit = isUnlimited ? null : TIME_STEPS[timeStepIndex]

  const handleStart = () => {
    mutation.mutate({
      sectionId,
      questionCount: Math.min(questionCount, maxQuestions),
      timeLimit,
      quizMode: "STUDY",
      evaluationModeId: evalModeId ?? evalModes?.[0]?.id,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-[680px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_270px]">
          <div className="flex flex-col">
            <DialogHeader className="border-b px-6 pb-4 pt-5 text-left">
              <DialogTitle>Configura Quiz</DialogTitle>
              <DialogDescription>
                Personalizza la sessione di studio
              </DialogDescription>
            </DialogHeader>

            <AnimatedStack className="flex flex-col gap-5 px-6 py-5">
              <AnimatedBlock>
                <SliderWithInput
                  label="Numero di domande"
                  value={questionCount}
                  onChange={setQuestionCount}
                  min={1}
                  max={maxQuestions}
                  hint={
                    questionCount === maxQuestions
                      ? `Tutte (${maxQuestions})`
                      : `${questionCount} di ${maxQuestions}`
                  }
                />
              </AnimatedBlock>

              <AnimatedBlock>
                <TimeTickRow
                  steps={TIME_STEPS}
                  index={timeStepIndex}
                  onChange={setTimeStepIndex}
                />
              </AnimatedBlock>

              {evalModes && evalModes.length >= 2 && (
                <AnimatedBlock>
                  <EvalSelect
                    modes={evalModes}
                    value={evalModeId}
                    onChange={setEvalModeId}
                  />
                </AnimatedBlock>
              )}

              {selectedEvalMode && (
                <AnimatedBlock>
                  <EvalInfoCard mode={selectedEvalMode} />
                </AnimatedBlock>
              )}
            </AnimatedStack>

            <DialogFooter className="flex justify-end gap-2 border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Annulla
              </Button>
              <Button onClick={handleStart} disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Inizia Quiz
              </Button>
            </DialogFooter>
          </div>

          <SummaryPanel footerTip="La sessione si avvia subito e non può essere messa in pausa.">
            <AnimatedBlock>
              <TimeBlock minutes={timeLimit} questionCount={questionCount} />
            </AnimatedBlock>
            <AnimatedBlock>
              <MetricBlock
                eyebrow="Domande"
                value={questionCount}
                total={maxQuestions}
                showBar
              />
            </AnimatedBlock>
            {selectedEvalMode && (
              <AnimatedBlock>
                <EvalBlock
                  mode={selectedEvalMode}
                  questionCount={questionCount}
                />
              </AnimatedBlock>
            )}
          </SummaryPanel>
        </div>
      </DialogContent>
    </Dialog>
  )
}
