import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/departments/")({
  beforeLoad: () => {
    throw redirect({ to: "/browse", statusCode: 301 })
  },
})
