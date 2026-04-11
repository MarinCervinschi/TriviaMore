import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/$department/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/departments/$department",
      params: { department: params.department },
      statusCode: 301,
    })
  },
})
