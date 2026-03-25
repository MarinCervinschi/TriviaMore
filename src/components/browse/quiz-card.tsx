import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function QuizCard({ questionCount }: { questionCount: number }) {
  if (questionCount === 0) return null

  return (
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
        <Button disabled className="w-full">
          Disponibile presto
        </Button>
      </CardContent>
    </Card>
  )
}
