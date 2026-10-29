import { Outlet, createFileRoute } from "@tanstack/react-router";

import { ConsoleShell } from "~/components/shell/console-shell";
import { getSessionFn } from "~/lib/auth/api";
import { readSectionSidebarOpen } from "~/lib/section-sidebar-state";

export const Route = createFileRoute("/_console")({
	beforeLoad: async () => {
		const session = await getSessionFn();
		// Cloudflare Access answers 403 before this; reaching it means the token went bad in between.
		if (!session) throw new Error("Accesso solo attraverso Cloudflare Access.");
		return { session };
	},
	// In the loader, so the value matches the one the server rendered with.
	loader: () => ({ sidebarOpen: readSectionSidebarOpen() }),
	component: ConsoleLayout,
});

function ConsoleLayout() {
	const { sidebarOpen } = Route.useLoaderData();
	const { session } = Route.useRouteContext();

	return (
		<ConsoleShell defaultSidebarOpen={sidebarOpen} account={session}>
			<Outlet />
		</ConsoleShell>
	);
}
