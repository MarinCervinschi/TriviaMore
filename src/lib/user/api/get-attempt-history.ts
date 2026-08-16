import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { getAttemptHistory } from "../service/attempt-history";
import type { AttemptHistoryEntry } from "../types";

export const getAttemptHistoryFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.handler(
		({ context }): Promise<AttemptHistoryEntry[]> =>
			context.user ? getAttemptHistory(context.user.id) : Promise.resolve([])
	);
