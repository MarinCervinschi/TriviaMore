import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { requireAdmin } from "@/lib/auth/guards"

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: () => requireAdmin(),
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] gap-6 py-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20">
          <AdminSidebar />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
