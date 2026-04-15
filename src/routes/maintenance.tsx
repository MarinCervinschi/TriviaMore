import { createFileRoute, redirect } from "@tanstack/react-router"

import { ComingSoon } from "@/components/coming-soon"
import { getMaintenanceModeFn } from "@/lib/maintenance/server"

export const Route = createFileRoute("/maintenance")({
  beforeLoad: async () => {
    const maintenance = await getMaintenanceModeFn()
    if (!maintenance) {
      throw redirect({ to: "/" })
    }
  },
  component: ComingSoon,
})
