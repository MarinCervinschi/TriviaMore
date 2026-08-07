import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { AnimatedBlock } from "@/components/session-config/animated-block"
import {
  SessionDialogColumn,
  SessionDialogShell,
} from "@/components/session-config/session-dialog"
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
    <SessionDialogShell open={open} onOpenChange={onOpenChange}>
      <SessionDialogColumn
        title="Configura Quiz"
        description="Personalizza la sessione di studio"
        submitLabel="Inizia Quiz"
        onSubmit={handleStart}
        onCancel={() => onOpenChange(false)}
        isPending={mutation.isPending}
      >
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
      </SessionDialogColumn>

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
            <EvalBlock mode={selectedEvalMode} questionCount={questionCount} />
          </AnimatedBlock>
        )}
      </SummaryPanel>
    </SessionDialogShell>
  )
}
