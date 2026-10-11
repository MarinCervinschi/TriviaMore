import { createFileRoute } from "@tanstack/react-router";

import { forwardToSource } from "~/lib/sources/proxy";

export const Route = createFileRoute("/api/proxy")({
	server: {
		handlers: {
			GET: ({ request }) => forwardToSource(request),
			POST: ({ request }) => forwardToSource(request),
		},
	},
});
