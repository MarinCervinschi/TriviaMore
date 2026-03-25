import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/flashcard/$sessionId")({
  component: FlashcardPage,
})

function FlashcardPage() {
  const { sessionId } = Route.useParams()
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Flashcard: {sessionId}</p>
    </div>
  )
}
