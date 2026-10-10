import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/user/progress")({
	beforeLoad: () => {
		throw redirect({ to: "/user/analytics", replace: true });
	},
});
