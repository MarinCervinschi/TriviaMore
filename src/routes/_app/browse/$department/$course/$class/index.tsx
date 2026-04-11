import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_app/browse/$department/$course/$class/",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/departments/$department/$course/$class",
      params: {
        department: params.department,
        course: params.course,
        class: params.class,
      },
      statusCode: 301,
    })
  },
})
