import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_app/browse/$department/$course/$class/$section/",
)({
  component: SectionPage,
})

function SectionPage() {
  const { section } = Route.useParams()
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Sezione</h1>
      <p className="mt-2 text-muted-foreground">Dettaglio sezione: {section}</p>
    </div>
  )
}
