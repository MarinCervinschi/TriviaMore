import { createFileRoute } from "@tanstack/react-router"

import { requireSuperadmin } from "@/lib/auth/guards"

export const Route = createFileRoute("/_app/admin/changelogs")({
  beforeLoad: () => requireSuperadmin(),
})
