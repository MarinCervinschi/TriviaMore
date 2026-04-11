import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_app/browse/$department/$course/$class/$section/",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/departments/$department/$course/$class/$section",
      params: {
        department: params.department,
        course: params.course,
        class: params.class,
        section: params.section,
      },
      statusCode: 301,
    })
  },
})
