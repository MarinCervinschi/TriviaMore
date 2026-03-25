import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/$department/$course/$class/")({
  component: ClassPage,
})

function ClassPage() {
  const { department, course, class: className } = Route.useParams()
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Classe</h1>
      <p className="mt-2 text-muted-foreground">
        Sezioni della classe: {className} (corso: {course}, dipartimento: {department})
      </p>
    </div>
  )
}
