import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/search/classes/")({
	beforeLoad: () => {
		throw redirect({
			to: "/search",
			search: { tipo: "insegnamenti" },
			replace: true,
		});
	},
});
