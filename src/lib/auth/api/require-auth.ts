import { createServerFn } from "@tanstack/react-start";

import { requireAuth } from "../guards";

// A server function, because route `beforeLoad` also runs in the browser.
export const requireAuthFn = createServerFn({ method: "GET" }).handler(() =>
	requireAuth()
);
