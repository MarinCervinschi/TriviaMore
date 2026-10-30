import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: () => new Response("ok", { headers: { "cache-control": "no-store" } }),
		},
	},
});
