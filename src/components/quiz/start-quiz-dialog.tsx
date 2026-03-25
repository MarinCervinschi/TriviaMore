import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { quizQueries } from "@/lib/quiz/queries"
import { startQuizFn, generateGuestQuizFn } from "@/lib/quiz/server"
import { setGuestQuizSession } from "@/lib/quiz/session"

export function StartQuizDialog({
  open,
  onOpenChange,
  sectionId,
  maxQuestions,
  isAuthenticated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  maxQuestions: number
  isAuthenticated: boolean
}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState("30")
  const [timeLimit, setTimeLimit] = useState("30")
  const [quizMode, setQuizMode] = useState<"STUDY" | "EXAM_SIMULATION">(
    "STUDY",
  )
  const [evalModeId, setEvalModeId] = useState<string | undefined>()

  const { data: evalModes } = useQuery({
    ...quizQueries.evaluationModes(),
    enabled: open,
  })

  const handleStart = async () => {
    setLoading(true)
    try {
      if (isAuthenticated) {
        const result = await startQuizFn({
          data: {
            sectionId,
            questionCount: Math.min(
              parseInt(questionCount),
              maxQuestions,
            ),
            timeLimit:
              timeLimit === "unlimited" ? null : parseInt(timeLimit),
            quizMode,
            evaluationModeId: evalModeId,
          },
        })
        onOpenChange(false)
        navigate({ to: "/quiz/$quizId", params: { quizId: result.quizId } })
      } else {
        const quiz = await generateGuestQuizFn({
          data: {
            sectionId,
            questionCount: Math.min(
              parseInt(questionCount),
              maxQuestions,
            ),
            timeLimit:
              timeLimit === "unlimited" ? undefined : parseInt(timeLimit),
          },
        })
        if (quiz) {
          setGuestQuizSession(quiz.id, quiz)
          onOpenChange(false)
          navigate({ to: "/quiz/$quizId", params: { quizId: quiz.id } })
        }
      }
    } catch (error) {
      console.error("Failed to start quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const questionOptions = [10, 20, 30].filter((n) => n <= maxQuestions)
  if (maxQuestions > 30) questionOptions.push(maxQuestions)
  else if (!questionOptions.includes(maxQuestions))
    questionOptions.push(maxQuestions)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Quiz</DialogTitle>
          <DialogDescription>
            Scegli le impostazioni per il tuo quiz
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Numero di domande</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionOptions.map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n === maxQuestions ? `Tutte (${n})` : n.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tempo limite</Label>
            <Select value={timeLimit} onValueChange={setTimeLimit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minuti</SelectItem>
                <SelectItem value="30">30 minuti</SelectItem>
                <SelectItem value="45">45 minuti</SelectItem>
                <SelectItem value="unlimited">Illimitato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAuthenticated && (
            <>
              <div className="space-y-2">
                <Label>Modalità</Label>
                <Select
                  value={quizMode}
                  onValueChange={(v) =>
                    setQuizMode(v as "STUDY" | "EXAM_SIMULATION")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDY">Studio</SelectItem>
                    <SelectItem value="EXAM_SIMULATION">
                      Simulazione Esame
                    </SelectItem>
                  </SelectContent>
                </Select>
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button onClick={handleStart} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inizia Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
