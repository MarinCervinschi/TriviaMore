import { createFileRoute, redirect } from "@tanstack/react-router";

import { ComingSoon } from "@/components/coming-soon";
import { inMaintenanceMode } from "@/lib/maintenance/server";

export const Route = createFileRoute("/maintenance")({
	beforeLoad: async () => {
		if (!(await inMaintenanceMode())) {
			throw redirect({ to: "/" });
		}
	},
	component: ComingSoon,
});
