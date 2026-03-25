import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/quiz/$quizId")({
  component: QuizPage,
})

function QuizPage() {
  const { quizId } = Route.useParams()
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Quiz: {quizId}</p>
    </div>
  )
}
