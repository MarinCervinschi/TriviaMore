import { createFileRoute, redirect } from "@tanstack/react-router";

/** The page was renamed: keep the old address working for anything still linking to it. */
export const Route = createFileRoute("/_app/user/progress")({
	beforeLoad: () => {
		throw redirect({ to: "/user/analytics", replace: true });
	},
});
