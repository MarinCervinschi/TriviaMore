import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_app/")({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="container py-16 text-center">
      <h1 className="gradient-text text-5xl font-bold">TriviaMore</h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
        La piattaforma di quiz e flashcard per studiare meglio.
      </p>
      <div className="mt-8">
        <Button size="lg" asChild>
          <Link to="/browse">Esplora i corsi</Link>
        </Button>
      </div>
    </div>
  )
}
