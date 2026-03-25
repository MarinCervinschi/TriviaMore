import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/user/bookmarks")({
  component: BookmarksPage,
})

function BookmarksPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Segnalibri</h1>
      <p className="mt-2 text-muted-foreground">Le domande che hai salvato.</p>
    </div>
  )
}
