import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, Info, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CardStackBlock,
  EvalBlock,
  Eyebrow,
  MetricBlock,
  TimeBlock,
} from "@/components/session-config/summary-blocks"
import { useStartExamFlashcard } from "@/lib/flashcard/mutations"
import { TIME_STEPS } from "@/lib/quiz/constants"
import { useStartQuiz } from "@/lib/quiz/mutations"
import { quizQueries } from "@/lib/quiz/queries"
import type { EvaluationMode } from "@/lib/quiz/types"

type ExamTab = "quiz" | "flashcard"

export function StartExamDialog({
  open,
  onOpenChange,
  sectionId,
  maxQuizQuestions,
  maxFlashcardQuestions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  maxQuizQuestions: number
  maxFlashcardQuestions: number
}) {
  const hasQuiz = maxQuizQuestions > 0
  const hasFlashcard = maxFlashcardQuestions > 0
  const [tab, setTab] = useState<ExamTab>(hasQuiz ? "quiz" : "flashcard")

  // Quiz state
  const [questionCount, setQuestionCount] = useState(
    Math.min(33, Math.max(1, maxQuizQuestions)),
  )
  const [timeStepIndex, setTimeStepIndex] = useState(TIME_STEPS.indexOf(60))
  const [evalModeId, setEvalModeId] = useState<string | undefined>()

  // Flashcard state
  const [cardCount, setCardCount] = useState(
    Math.min(20, Math.max(1, maxFlashcardQuestions)),
  )

  const { data: evalModes } = useQuery({
    ...quizQueries.evaluationModes(),
    enabled: open && hasQuiz,
  })

  const selectedEvalMode = evalModes?.find(
    (m) => m.id === (evalModeId ?? evalModes?.[0]?.id),
  )

  const quizMutation = useStartQuiz(() => onOpenChange(false))
  const flashcardMutation = useStartExamFlashcard(() => onOpenChange(false))
  const loading = quizMutation.isPending || flashcardMutation.isPending

  const isUnlimited = timeStepIndex >= TIME_STEPS.length
  const timeLimit = isUnlimited ? null : TIME_STEPS[timeStepIndex]

  const handleStartQuiz = () => {
    quizMutation.mutate({
      sectionId,
      questionCount: Math.min(questionCount, maxQuizQuestions),
      timeLimit,
      quizMode: "EXAM_SIMULATION",
      evaluationModeId: evalModeId ?? evalModes?.[0]?.id,
    })
  }

  const handleStartFlashcard = () => {
    flashcardMutation.mutate({
      sectionId,
      cardCount: Math.min(cardCount, maxFlashcardQuestions),
    })
  }

  const showTabs = hasQuiz && hasFlashcard

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-[680px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_270px]">
          <div className="flex flex-col">
            <DialogHeader className="border-b px-6 pb-4 pt-5 text-left">
              <DialogTitle>Simulazione Esame</DialogTitle>
              <DialogDescription>
                Domande da tutte le sezioni dell&apos;insegnamento
              </DialogDescription>
            </DialogHeader>

            {showTabs ? (
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as ExamTab)}
                className="flex flex-1 flex-col"
              >
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="quiz"
                      className="gap-1.5 focus-visible:shadow-none focus-visible:ring-offset-0"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Quiz
                    </TabsTrigger>
                    <TabsTrigger
                      value="flashcard"
                      className="gap-1.5 focus-visible:shadow-none focus-visible:ring-offset-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Flashcard
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="quiz" className="m-0 px-6 py-5">
                  <AnimatedStack className="flex flex-col gap-5">
                    <QuizConfigBody
                      questionCount={questionCount}
                      setQuestionCount={setQuestionCount}
                      timeStepIndex={timeStepIndex}
                      setTimeStepIndex={setTimeStepIndex}
                      evalModeId={evalModeId}
                      setEvalModeId={setEvalModeId}
                      evalModes={evalModes}
                      selectedEvalMode={selectedEvalMode}
                      maxQuestions={maxQuizQuestions}
                    />
                  </AnimatedStack>
                </TabsContent>
                <TabsContent value="flashcard" className="m-0 px-6 py-5">
                  <AnimatedStack className="flex flex-col gap-5">
                    <FlashcardConfigBody
                      cardCount={cardCount}
                      setCardCount={setCardCount}
                      maxCards={maxFlashcardQuestions}
                    />
                  </AnimatedStack>
                </TabsContent>
              </Tabs>
            ) : hasQuiz ? (
              <AnimatedStack className="flex flex-col gap-5 px-6 py-5">
                <QuizConfigBody
                  questionCount={questionCount}
                  setQuestionCount={setQuestionCount}
                  timeStepIndex={timeStepIndex}
                  setTimeStepIndex={setTimeStepIndex}
                  evalModeId={evalModeId}
                  setEvalModeId={setEvalModeId}
                  evalModes={evalModes}
                  selectedEvalMode={selectedEvalMode}
                  maxQuestions={maxQuizQuestions}
                />
              </AnimatedStack>
            ) : (
              <AnimatedStack className="flex flex-col gap-5 px-6 py-5">
                <FlashcardConfigBody
                  cardCount={cardCount}
                  setCardCount={setCardCount}
                  maxCards={maxFlashcardQuestions}
                />
              </AnimatedStack>
            )}

            <DialogFooter className="mt-auto flex justify-end gap-2 border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                onClick={
                  tab === "quiz" ? handleStartQuiz : handleStartFlashcard
                }
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tab === "quiz" ? "Inizia Quiz" : "Inizia Flashcard"}
              </Button>
            </DialogFooter>
          </div>

          <SummaryPanel footerTip="Simulazione esame · raccoglie da tutte le sezioni del corso.">
            {tab === "quiz" ? (
              <>
                <AnimatedBlock>
                  <TimeBlock
                    minutes={timeLimit}
                    questionCount={questionCount}
                  />
                </AnimatedBlock>
                <AnimatedBlock>
                  <MetricBlock
                    eyebrow="Domande"
                    value={questionCount}
                    total={maxQuizQuestions}
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
              </>
            ) : (
              <>
                <AnimatedBlock>
                  <CardStackBlock
                    count={cardCount}
                    max={maxFlashcardQuestions}
                  />
                </AnimatedBlock>
                <AnimatedBlock>
                  <div className="flex flex-col gap-1">
                    <Eyebrow>Modalità</Eyebrow>
                    <div className="text-[13px] font-semibold text-foreground">
                      Studio libero
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                      Nessun punteggio, nessun timer.
                    </p>
                  </div>
                </AnimatedBlock>
              </>
            )}
          </SummaryPanel>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QuizConfigBody({
  questionCount,
  setQuestionCount,
  timeStepIndex,
  setTimeStepIndex,
  evalModeId,
  setEvalModeId,
  evalModes,
  selectedEvalMode,
  maxQuestions,
}: {
  questionCount: number
  setQuestionCount: (v: number) => void
  timeStepIndex: number
  setTimeStepIndex: (v: number) => void
  evalModeId: string | undefined
  setEvalModeId: (v: string) => void
  evalModes: EvaluationMode[] | undefined
  selectedEvalMode: EvaluationMode | undefined
  maxQuestions: number
}) {
  return (
    <>
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
    </>
  )
}

function FlashcardConfigBody({
  cardCount,
  setCardCount,
  maxCards,
}: {
  cardCount: number
  setCardCount: (v: number) => void
  maxCards: number
}) {
  return (
    <>
      <AnimatedBlock>
        <SliderWithInput
          label="Numero di carte"
          value={cardCount}
          onChange={setCardCount}
          min={1}
          max={maxCards}
          hint={
            cardCount === maxCards
              ? `Tutte (${maxCards})`
              : `${cardCount} di ${maxCards}`
          }
        />
      </AnimatedBlock>
      <AnimatedBlock>
        <div className="flex gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
            strokeWidth={1.75}
          />
          <p className="leading-relaxed">
            Modalità studio libero. Gira la carta, valuta la tua confidenza con{" "}
            <span className="font-semibold text-foreground">Sapevo</span> /{" "}
            <span className="font-semibold text-foreground">Non sapevo</span>.
            Nessun timer, nessun punteggio.
          </p>
        </div>
      </AnimatedBlock>
    </>
  )
}
