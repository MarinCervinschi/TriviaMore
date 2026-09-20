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
		// Read here rather than in the component: the value has to be the same one the
		// server rendered with, and the loader's result is what gets sent along with it.
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
				// Inside the panel the content fills it: an 80rem column centred in a wide
				// panel leaves the gutters the shell was meant to remove. Bottom nav
				// clearance on mobile (h-16 + iOS safe area).
				className="isolate pb-[calc(4rem+env(safe-area-inset-bottom))] [--app-header-h:3rem] [--container-max:none] md:pb-0"
			>
				{/*
				 * Starts below the header, so the bar stays clean and the dots' own fade
				 * begins where they do. Absolute so the band scrolls with the content
				 * instead of enclosing it, and behind it: `isolate` on the panel is what
				 * lets -z-10 sit above the panel's own `bg-card` rather than under it.
				 */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-(--app-header-h) bottom-0 -z-10 overflow-hidden"
				>
					<PageBand level="app" glow={false} />
				</div>
				<AppHeader />
				<Outlet />
			</SidebarInset>
			<MobileBottomNav />
		</SidebarProvider>
	);
}
