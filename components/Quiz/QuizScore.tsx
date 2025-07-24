import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface QuizScoreProps {
  correctAnswers: number
  totalQuestions: number
}

export default function QuizScore({ correctAnswers, totalQuestions }: QuizScoreProps) {
  const score = (correctAnswers / (totalQuestions * 3)) * 100
  const roundedScore = Math.round(score)

  const getMessage = () => {
    if (score === 100) return "Perfect score! Congratulations!"
    if (score >= 80) return "Great job! You did excellently!"
    if (score >= 60) return "Good effort! You're on the right track."
    if (score >= 40) return "Not bad, but there's room for improvement."
    return "Keep practicing, you'll get better!"
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardContent className="space-y-4 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-4xl font-bold">{roundedScore}%</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-primary cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold mb-1">Calcolo del punteggio:</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      <li>Ogni domanda vale 3 punti (risposte corrette)</li>
                      <li>0 punti per almeno una risposta sbagliata</li>
                      <li>Punteggio frazionario per risposte parzialmente corrette</li>
                    </ul>

                    <p className="text-sm">
                      Percentuale: ({correctAnswers} ÷ {totalQuestions * 3}) × 100 = {roundedScore}%
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted">
              {correctAnswers} out of {totalQuestions * 3} Points
            </p>
          </div>
          <p className="text-center font-medium">{getMessage()}</p>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}