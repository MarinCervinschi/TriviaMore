import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/$department/$course/")({
  component: CoursePage,
})

function CoursePage() {
  const { department, course } = Route.useParams()
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Corso</h1>
      <p className="mt-2 text-muted-foreground">
        Classi del corso: {course} (dipartimento: {department})
      </p>
    </div>
  )
}
