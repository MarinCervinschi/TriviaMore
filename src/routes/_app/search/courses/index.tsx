import { createFileRoute, redirect } from "@tanstack/react-router";

/** The two searches became one; the type is a filter on it. */
export const Route = createFileRoute("/_app/search/courses/")({
	beforeLoad: () => {
		throw redirect({ to: "/search", search: { tipo: "corsi" }, replace: true });
	},
});
