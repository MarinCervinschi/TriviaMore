import { Outlet, createFileRoute } from "@tanstack/react-router"
import { requireAuth } from "@/lib/auth/guards"
import { requireLegalAcceptance } from "@/lib/legal/guards"

export const Route = createFileRoute("/_app/user")({
  beforeLoad: async () => {
    await requireAuth()
    await requireLegalAcceptance()
  },
  component: () => <Outlet />,
})
