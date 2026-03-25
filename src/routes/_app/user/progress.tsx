import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/user/progress")({
  component: ProgressPage,
})

function ProgressPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Progresso</h1>
      <p className="mt-2 text-muted-foreground">Il tuo avanzamento nei quiz e nelle flashcard.</p>
    </div>
  )
}
