import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { getDailyStudyStats } from "../service/study-stats";
import type { DailyStudyStat } from "../types";

export const getStudyStatsFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.handler(
		({ context }): Promise<DailyStudyStat[]> =>
			context.user ? getDailyStudyStats(context.user.id) : Promise.resolve([])
	);
