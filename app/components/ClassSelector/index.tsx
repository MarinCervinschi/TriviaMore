import { Button } from "@components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import QuizClass from "@/types/QuizClass"
import Link from "next/link"

interface ClassSelectorProps {
  classes: QuizClass[]
}

export function ClassSelector({ classes }: ClassSelectorProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Select a Quiz Class</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((quizClass) => (
            <Button key={quizClass.id} asChild variant="outline" className="h-auto py-4 text-lg">
              <Link href={`/${quizClass.id}`}>{quizClass.name}</Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

