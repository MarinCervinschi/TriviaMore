import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { masteryScopeSchema } from "../schemas";
import { getAttemptHistory } from "../service/attempt-history";
import type { AttemptHistoryEntry } from "../types";

export const getAttemptHistoryFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(masteryScopeSchema)
	.handler(
		({ data, context }): Promise<AttemptHistoryEntry[]> =>
			context.user ? getAttemptHistory(context.user.id, data) : Promise.resolve([])
	);
