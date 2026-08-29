import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { masteryScopeSchema } from "../schemas";
import { getMastery } from "../service/mastery";
import type { UserMastery } from "../types";

const EMPTY: UserMastery = {
	totalAnswers: 0,
	avgSecondsPerQuestion: null,
	byDifficulty: [],
	sections: [],
	weakSections: [],
	strongSections: [],
};

export const getMasteryFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(masteryScopeSchema)
	.handler(
		({ data, context }): Promise<UserMastery> =>
			context.user ? getMastery(context.user.id, data) : Promise.resolve(EMPTY)
	);
