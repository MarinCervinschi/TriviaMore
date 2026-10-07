import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_console/sources/")({
	beforeLoad: () => {
		throw redirect({ to: "/sources/catalog" });
	},
});
