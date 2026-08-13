// Storybook deliberately does not load the TanStack Start Vite plugin, and that plugin is what strips
// a server function's handler from the client bundle. Without it, importing anything under
// `src/lib/*/api/` drags the whole server core in and the preview build dies on `node:async_hooks`,
// `node:stream`, and on down the chain.
//
// This stands in for the one specifier that boundary crosses. The builder is chainable so the api
// modules still typecheck and build; calling the result throws, because a story that reaches the
// network is a story with a bug, and a loud failure beats a silent one.

type Handler = (...args: unknown[]) => unknown;

function serverFnBuilder(): Record<string, unknown> {
	const builder = {
		middleware: () => serverFnBuilder(),
		validator: () => serverFnBuilder(),
		inputValidator: () => serverFnBuilder(),
		handler: (_fn?: Handler) => {
			const callable = () => {
				throw new Error(
					"A server function was called inside a story. Seed the query cache or pass the data as a prop instead."
				);
			};
			return Object.assign(callable, { url: "/__story__" });
		},
	};
	return builder;
}

export function createServerFn(_options?: unknown) {
	return serverFnBuilder();
}

export function createMiddleware(_options?: unknown) {
	const builder: Record<string, unknown> = {
		server: () => builder,
		client: () => builder,
		middleware: () => builder,
		validator: () => builder,
		inputValidator: () => builder,
	};
	return builder;
}

export function createStart(_fn?: unknown) {
	return {};
}
export function createStartHandler(_opts?: unknown) {
	return () => new Response(null);
}
export const defaultStreamHandler = () => new Response(null);

export function getCookies(): Record<string, string> {
	return {};
}
export function setCookie(_name: string, _value: string, _options?: unknown): void {}
export function getRequestHeader(_name: string): string | undefined {
	return undefined;
}
export function getRequestIP(): string | undefined {
	return undefined;
}
