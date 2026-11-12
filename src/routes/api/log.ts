import { createFileRoute } from "@tanstack/react-router";

import { createLogIntake } from "@/lib/logging/intake";
import { browserLogBatch } from "@/lib/logging/schemas";
import { shipBrowserEvent } from "@/lib/logging/server";
import { clientIp } from "@/lib/server/client-ip";

// Proxies to Seq, so the ingestion key never reaches the bundle.

const admit = createLogIntake();

export const Route = createFileRoute("/api/log")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const bytes = Number(request.headers.get("content-length") ?? 0);
				if (!admit(clientIp(request.headers) ?? "unknown", bytes)) {
					return new Response(null, { status: 429 });
				}

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return new Response(null, { status: 400 });
				}

				const parsed = browserLogBatch.safeParse(body);
				if (!parsed.success) {
					return new Response(null, { status: 400 });
				}

				for (const event of parsed.data.events) {
					shipBrowserEvent(event);
				}

				return new Response(null, { status: 204 });
			},
		},
	},
});
