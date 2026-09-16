import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { getAchievements } from "../service";
import type { AchievementsOverview } from "../types";

const EMPTY: AchievementsOverview = {
	categories: [],
	unlocked: 0,
	total: 0,
	nextUp: [],
	pinned: [],
};

export const getAchievementsFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.handler(
		({ context }): Promise<AchievementsOverview> =>
			context.user ? getAchievements(context.user.id) : Promise.resolve(EMPTY)
	);
