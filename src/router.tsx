import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { ErrorPage } from "@/components/error/error-page";
import { NotFoundPage } from "@/components/error/not-found-page";
import { LoadingPage } from "@/components/loading/loading-page";
import { installBrowserErrorHandlers, reportBrowserError } from "@/lib/logging/browser";

import { routeTree } from "./routeTree.gen";

if (typeof window !== "undefined") {
	installBrowserErrorHandlers();
	window.addEventListener("vite:preloadError", () => {
		const key = "tm:preload-reloaded-at";
		const last = Number(sessionStorage.getItem(key) ?? 0);
		if (Date.now() - last < 10_000) return;
		sessionStorage.setItem(key, String(Date.now()));
		window.location.reload();
	});
}

const FIVE_MINUTES = 1000 * 60 * 5;

export function getRouter() {
	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, mutation) => {
				if (typeof window === "undefined") return;
				const key = mutation.options.mutationKey;
				reportBrowserError("Mutation failed", error, {
					level: "Warning",
					properties: {
						Path: window.location.pathname,
						...(key ? { Mutation: JSON.stringify(key) } : {}),
					},
				});
			},
		}),
		defaultOptions: {
			queries: {
				staleTime: FIVE_MINUTES,
			},
		},
	});

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		// The shell scrolls its own panel, so a new page is sent to the top by selector.
		scrollToTopSelectors: ['[data-scroll-restoration-id="app-panel"]'],
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultPendingMs: 200,
		defaultPendingMinMs: 500,
		defaultPendingComponent: LoadingPage,
		defaultNotFoundComponent: () => <NotFoundPage withBand={false} />,
		// A route's errorComponent, then this; it never walks up to __root's.
		defaultErrorComponent: ({ error }) => <ErrorPage error={error} withBand={false} />,
	});

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
