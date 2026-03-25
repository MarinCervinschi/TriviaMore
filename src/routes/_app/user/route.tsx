import { Outlet, createFileRoute } from "@tanstack/react-router"
import { requireAuth } from "@/lib/auth/guards"

export const Route = createFileRoute("/_app/user")({
  beforeLoad: () => requireAuth(),
  component: () => <Outlet />,
})
