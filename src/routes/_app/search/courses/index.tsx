import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/search/courses/")({
	beforeLoad: () => {
		throw redirect({ to: "/search", search: { tipo: "corsi" }, replace: true });
	},
});
