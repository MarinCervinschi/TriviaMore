import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_app/departments/$department/$course/$class/",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/browse/$department/$course/$class",
      params: {
        department: params.department,
        course: params.course,
        class: params.class,
      },
      statusCode: 301,
    })
  },
})
