import { createFileRoute } from "@tanstack/react-router";

import { browserLogBatch } from "@/lib/logging/schemas";
import { shipBrowserEvent } from "@/lib/logging/server";
import { clientIp } from "@/lib/server/client-ip";

// Proxies to Seq, so the ingestion key never reaches the bundle.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const MAX_TRACKED_IPS = 10_000;

type Bucket = { count: number; windowStart: number };

// The IP is a rate-limit key only and is never logged.
const buckets = new Map<string, Bucket>();

function pruneExpired(now: number): void {
	for (const [ip, bucket] of buckets) {
		if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(ip);
	}
	if (buckets.size >= MAX_TRACKED_IPS) buckets.clear();
}

function rateLimited(ip: string, now: number): boolean {
	const bucket = buckets.get(ip);
	if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
		if (buckets.size >= MAX_TRACKED_IPS) pruneExpired(now);
		buckets.set(ip, { count: 1, windowStart: now });
		return false;
	}
	bucket.count += 1;
	return bucket.count > MAX_PER_WINDOW;
}

export const Route = createFileRoute("/api/log")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (rateLimited(clientIp(request.headers) ?? "unknown", Date.now())) {
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
