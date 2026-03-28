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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStartExamFlashcard } from "@/lib/flashcard/mutations"
import { useStartQuiz } from "@/lib/quiz/mutations"
import { quizQueries } from "@/lib/quiz/queries"
import type { EvaluationMode } from "@/lib/quiz/types"

const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120]

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
  const [tab, setTab] = useState<string>(hasQuiz ? "quiz" : "flashcard")

  // Quiz state
  const [questionCount, setQuestionCount] = useState(
    Math.min(30, maxQuizQuestions),
  )
  const [timeStepIndex, setTimeStepIndex] = useState(
    TIME_STEPS.indexOf(60),
  )
  const [evalModeId, setEvalModeId] = useState<string | undefined>()

  // Flashcard state
  const [cardCount, setCardCount] = useState(
    Math.min(20, maxFlashcardQuestions),
  )

  const { data: evalModes } = useQuery({
    ...quizQueries.evaluationModes(),
    enabled: open && tab === "quiz",
  })

  const selectedEvalMode = evalModes?.find(
    (m) => m.id === (evalModeId ?? evalModes?.[0]?.id),
  )

  const quizMutation = useStartQuiz(() => onOpenChange(false))
  const flashcardMutation = useStartExamFlashcard(() => onOpenChange(false))
  const loading = quizMutation.isPending || flashcardMutation.isPending

  const handleStartQuiz = () => {
    const time = TIME_STEPS[timeStepIndex]
    quizMutation.mutate({
      sectionId,
      questionCount: Math.min(questionCount, maxQuizQuestions),
      timeLimit: time === undefined ? null : time,
      quizMode: "EXAM_SIMULATION",
      evaluationModeId: evalModeId,
    })
  }

  const handleStartFlashcard = () => {
    flashcardMutation.mutate({
      sectionId,
      cardCount: Math.min(cardCount, maxFlashcardQuestions),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Simulazione Esame</DialogTitle>
          <DialogDescription>
            Domande da tutte le sezioni della classe
          </DialogDescription>
        </DialogHeader>

        {hasQuiz && hasFlashcard ? (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quiz" className="gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="flashcard" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Flashcard
              </TabsTrigger>
            </TabsList>
            <TabsContent value="quiz">
              <QuizConfig
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
            </TabsContent>
            <TabsContent value="flashcard">
              <FlashcardConfig
                cardCount={cardCount}
                setCardCount={setCardCount}
                maxCards={maxFlashcardQuestions}
              />
            </TabsContent>
          </Tabs>
        ) : hasQuiz ? (
          <QuizConfig
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
        ) : (
          <FlashcardConfig
            cardCount={cardCount}
            setCardCount={setCardCount}
            maxCards={maxFlashcardQuestions}
          />
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            onClick={tab === "quiz" ? handleStartQuiz : handleStartFlashcard}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tab === "quiz" ? "Inizia Quiz" : "Inizia Flashcard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuizConfig({
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
        </div>
      )}

      {selectedEvalMode && evalModes && evalModes.length > 1 && (
        <EvalModeInfo mode={selectedEvalMode} />
      )}

      {evalModes && evalModes.length === 1 && evalModes[0] && (
        <EvalModeInfo mode={evalModes[0]} />
      )}
    </div>
  )
}

function FlashcardConfig({
  cardCount,
  setCardCount,
  maxCards,
}: {
  cardCount: number
  setCardCount: (v: number) => void
  maxCards: number
}) {
  return (
    <div className="grid gap-5 py-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Numero di carte</Label>
          <span className="text-sm font-medium tabular-nums">
            {cardCount === maxCards ? `Tutte (${cardCount})` : cardCount}
          </span>
        </div>
        <Slider
          value={[cardCount]}
          onValueChange={([v]) => setCardCount(v)}
          min={1}
          max={maxCards}
          step={1}
        />
      </div>
    </div>
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
