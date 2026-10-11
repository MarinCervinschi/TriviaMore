import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireLegalAcceptanceFn } from "@/lib/legal/api";

export const Route = createFileRoute("/_app/user")({
	beforeLoad: async () => {
		await requireLegalAcceptanceFn();
	},
	// High, so the global spinner never shows for the guard and the child skeletons own the loading UI.
	pendingMs: 60_000,
	component: () => <Outlet />,
});
