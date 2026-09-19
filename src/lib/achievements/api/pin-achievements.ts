import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { pinAchievementsSchema } from "../schemas";
import { setPinnedAchievements } from "../service";

export const pinAchievementsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(pinAchievementsSchema)
	.handler(({ data, context }) => setPinnedAchievements(context.user.id, data.keys));
