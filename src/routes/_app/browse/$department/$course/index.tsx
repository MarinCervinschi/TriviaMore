import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/$department/$course/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/departments/$department/$course",
      params: { department: params.department, course: params.course },
      statusCode: 301,
    })
  },
})
