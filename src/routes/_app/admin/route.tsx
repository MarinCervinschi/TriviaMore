import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminFn } from "@/lib/auth/api";
import { requireLegalAcceptanceFn } from "@/lib/legal/api";

export const Route = createFileRoute("/_app/admin")({
	beforeLoad: async () => {
		await requireAdminFn();
		await requireLegalAcceptanceFn();
	},
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<div className="relative min-h-screen">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="from-muted/20 absolute inset-0 bg-gradient-to-b to-transparent" />
			</div>

			<div className="container flex gap-6 py-6">
				<aside className="hidden w-72 shrink-0 lg:block">
					<div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
						<AdminSidebar />
					</div>
				</aside>
				<main className="border-border/50 min-w-0 flex-1 border-l pl-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
