import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/departments/$department/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/browse/$department",
      params: { department: params.department },
      statusCode: 301,
    })
  },
})
