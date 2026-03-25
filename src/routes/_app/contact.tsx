import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/contact")({
  component: ContactPage,
})

function ContactPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Contatti</h1>
      <p className="mt-4 text-muted-foreground">
        Per domande o feedback, contattaci.
      </p>
    </div>
  )
}
