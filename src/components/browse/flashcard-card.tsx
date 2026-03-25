import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FlashcardCard({ questionCount }: { questionCount: number }) {
  if (questionCount === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Flashcard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          {questionCount} flashcard disponibili.
        </p>
        <Button disabled className="w-full">
          Disponibile presto
        </Button>
      </CardContent>
    </Card>
  )
}
