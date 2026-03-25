import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/about")({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Chi siamo</h1>
      <p className="mt-4 text-muted-foreground">
        TriviaMore e' una piattaforma di studio basata su quiz e flashcard.
      </p>
    </div>
  )
}
