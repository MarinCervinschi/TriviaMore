import { Outlet, createFileRoute } from "@tanstack/react-router";

import { LandingFooter, footerSections } from "@/components/landing";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Navbar } from "@/components/layout/navbar";
import { PageBand } from "@/components/layout/page-band";
import { readSidebarOpen } from "@/components/layout/sidebar-state";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { getSessionFn } from "@/lib/auth/api";

export const Route = createFileRoute("/_app")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData({
			queryKey: ["auth", "session"],
			queryFn: () => getSessionFn(),
		});
		// In the loader, so the value matches the one the server rendered with.
		return { sidebarOpen: readSidebarOpen() };
	},
	component: AppLayout,
});

function AppLayout() {
	const { isAuthenticated } = useAuth();
	const { sidebarOpen } = Route.useLoaderData();

	if (!isAuthenticated) {
		return (
			<div className="relative isolate flex min-h-screen flex-col">
				<PageBand level="public" />
				<Navbar />
				<div className="flex min-h-screen flex-1 flex-col">
					<main id="main-content" className="flex-1">
						<Outlet />
					</main>
					<LandingFooter sections={footerSections} />
				</div>
			</div>
		);
	}

	return (
		<SidebarProvider defaultOpen={sidebarOpen}>
			<AppSidebar />
			<SidebarInset
				id="main-content"
				className="isolate pb-[calc(4rem+env(safe-area-inset-bottom))] [--app-header-h:3rem] [--container-max:none] md:pb-0"
			>
				{/* `isolate` on the panel lets -z-10 sit above the panel's own `bg-card`. */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-(--app-header-h) bottom-0 -z-10 overflow-hidden"
				>
					<PageBand level="app" glow={false} />
				</div>
				<AppHeader />

				{/* 80rem caps an application's content; a page opts out with `--container-max: none`. */}
				<div className="[--container-max:80rem]">
					<Outlet />
				</div>
			</SidebarInset>
			<MobileBottomNav />
		</SidebarProvider>
	);
}
