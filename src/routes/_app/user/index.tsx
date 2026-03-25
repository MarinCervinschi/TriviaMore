import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/user/")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Il tuo pannello di controllo.</p>
    </div>
  )
}
