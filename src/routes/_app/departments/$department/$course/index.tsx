import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/departments/$department/$course/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/browse/$department/$course",
      params: { department: params.department, course: params.course },
      statusCode: 301,
    })
  },
})
