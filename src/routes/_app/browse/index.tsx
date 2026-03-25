import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/")({
  component: BrowsePage,
})

function BrowsePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Esplora</h1>
      <p className="mt-2 text-muted-foreground">Sfoglia i dipartimenti disponibili.</p>
    </div>
  )
}
