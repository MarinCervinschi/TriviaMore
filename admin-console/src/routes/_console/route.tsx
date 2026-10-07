import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { ConsoleShell } from "~/components/shell/console-shell";
import { getSessionFn } from "~/lib/auth/api";
import { readSectionSidebarOpen } from "~/lib/section-sidebar-state";

export const Route = createFileRoute("/_console")({
	beforeLoad: async ({ location }) => {
		const session = await getSessionFn();
		if (!session) {
			throw redirect({ to: "/login", search: { redirect: location.href } });
		}
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
		<ConsoleShell defaultSidebarOpen={sidebarOpen} email={session.email}>
			<Outlet />
		</ConsoleShell>
	);
}
