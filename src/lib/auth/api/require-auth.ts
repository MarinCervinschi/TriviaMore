import { createServerFn } from "@tanstack/react-start";

import { requireAuth } from "../guards";

// Route `beforeLoad` also runs in the browser, so the guards it calls have to
// cross the wire.
export const requireAuthFn = createServerFn({ method: "GET" }).handler(() =>
	requireAuth()
);
