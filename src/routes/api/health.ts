import { createFileRoute } from "@tanstack/react-router";

// Liveness only: a database outage should not make Coolify restart a container that would come back the same.
export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: () => new Response("ok", { headers: { "cache-control": "no-store" } }),
		},
	},
});
