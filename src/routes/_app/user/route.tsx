import { Outlet, createFileRoute } from "@tanstack/react-router"
import { requireAuthFn } from "@/lib/auth/api"
import { requireLegalAcceptanceFn } from "@/lib/legal/api"

export const Route = createFileRoute("/_app/user")({
  beforeLoad: async () => {
    await requireAuthFn()
    await requireLegalAcceptanceFn()
  },
  // This layout has no UI of its own — only an auth/legal guard. Push the
  // pending threshold high enough that the global LoadingPage spinner never
  // shows for the guard itself, letting each child route's pendingComponent
  // own the loading UI for /user/*. The default 200ms threshold would
  // otherwise flash the spinner before the child skeleton on slow auth.
  pendingMs: 60_000,
  component: () => <Outlet />,
})
