import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/$department/")({
  component: DepartmentPage,
})

function DepartmentPage() {
  const { department } = Route.useParams()
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Dipartimento</h1>
      <p className="mt-2 text-muted-foreground">Corsi del dipartimento: {department}</p>
    </div>
  )
}
