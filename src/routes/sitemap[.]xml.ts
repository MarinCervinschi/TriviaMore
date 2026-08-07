import { createFileRoute } from "@tanstack/react-router";

import { buildSitemap } from "@/lib/sitemap/service";

const TTL_MS = 60 * 60 * 1000;

let cached: { xml: string; at: number } | null = null;

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				// Building it costs four paginated catalog queries, so hold it in
				// memory between crawls even when no CDN is in front.
				if (!cached || Date.now() - cached.at > TTL_MS) {
					cached = { xml: await buildSitemap(), at: Date.now() };
				}

				return new Response(cached.xml, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600, s-maxage=86400",
					},
				});
			},
		},
	},
});
