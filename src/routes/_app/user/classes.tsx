import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/user/classes")({
  component: UserClassesPage,
})

function UserClassesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Le mie classi</h1>
      <p className="mt-2 text-muted-foreground">Le classi che stai seguendo.</p>
    </div>
  )
}
