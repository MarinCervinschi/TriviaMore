import { createMiddleware } from "@tanstack/react-start";

const PRIVATE = "private, no-store";

function keepPrivate(response: Response): Response {
	if (response.headers.has("cache-control")) return response;
	try {
		response.headers.set("cache-control", PRIVATE);
		return response;
	} catch {
		// Response.redirect() and fetched responses carry immutable headers.
		const copy = new Response(response.body, response);
		copy.headers.set("cache-control", PRIVATE);
		return copy;
	}
}

/** Sends `private, no-store` on every response the app renders, unless its route set a Cache-Control of its own. */
export const cacheControlMiddleware = createMiddleware({ type: "request" }).server(
	async ({ next }) => {
		const result = await next();
		return { ...result, response: keepPrivate(result.response) };
	}
);
