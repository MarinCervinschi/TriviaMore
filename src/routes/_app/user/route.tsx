import { Outlet, createFileRoute } from "@tanstack/react-router"
import { requireAuth } from "@/lib/auth/guards"
import { requireLegalAcceptance } from "@/lib/legal/guards"

export const Route = createFileRoute("/_app/user")({
  beforeLoad: async () => {
    await requireAuth()
    await requireLegalAcceptance()
  },
  // This layout has no UI of its own — only an auth/legal guard. Suppress the
  // global defaultPendingComponent (the LoadingPage spinner) so it doesn't
  // flash before the child route's skeleton on slow auth checks. The child
  // route's pendingComponent owns the loading UI for /user/*.
  pendingComponent: () => null,
  pendingMinMs: 0,
  component: () => <Outlet />,
})
