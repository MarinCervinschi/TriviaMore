import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/user/requests/$requestId")({
  beforeLoad: () => {
    // All conversations are handled in the inbox split view
    throw redirect({ to: "/user/requests" })
  },
})
