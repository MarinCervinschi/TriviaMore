import { createFileRoute, redirect } from "@tanstack/react-router";

/** The two searches became one; the type is a filter on it. */
export const Route = createFileRoute("/_app/search/classes/")({
	beforeLoad: () => {
		throw redirect({
			to: "/search",
			search: { tipo: "insegnamenti" },
			replace: true,
		});
	},
});
