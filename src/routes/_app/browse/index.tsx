import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/browse/")({
  beforeLoad: () => {
    throw redirect({ to: "/departments", statusCode: 301 })
  },
})
