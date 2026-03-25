import { useState } from "react"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StartQuizDialog } from "@/components/quiz/start-quiz-dialog"

export function QuizCard({
  questionCount,
  sectionId,
  isAuthenticated,
}: {
  questionCount: number
  sectionId: string
  isAuthenticated: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (questionCount === 0) return null

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            {questionCount} domande disponibili per il quiz.
          </p>
          <Button className="w-full" onClick={() => setDialogOpen(true)}>
            Inizia Quiz
          </Button>
        </CardContent>
      </Card>
      <StartQuizDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectionId={sectionId}
        maxQuestions={questionCount}
        isAuthenticated={isAuthenticated}
      />
    </>
  )
}
