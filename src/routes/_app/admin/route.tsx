import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { requireAdmin } from "@/lib/auth/guards"

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: () => requireAdmin(),
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="relative container flex min-h-[calc(100vh-3.5rem)] gap-6 py-6">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent" />
      </div>

      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <AdminSidebar />
        </div>
      </aside>
      <main className="min-w-0 flex-1 border-l border-border/50 pl-6">
        <Outlet />
      </main>
    </div>
  )
}
