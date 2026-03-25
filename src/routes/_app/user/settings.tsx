import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/user/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Impostazioni</h1>
      <p className="mt-2 text-muted-foreground">Gestisci il tuo account.</p>
    </div>
  )
}
