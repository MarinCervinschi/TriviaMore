import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { masteryScopeSchema } from "../schemas";
import { getDailyStudyStats } from "../service/study-stats";
import type { DailyStudyStat } from "../types";

export const getStudyStatsFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(masteryScopeSchema)
	.handler(
		({ data, context }): Promise<DailyStudyStat[]> =>
			context.user ? getDailyStudyStats(context.user.id, data) : Promise.resolve([])
	);
