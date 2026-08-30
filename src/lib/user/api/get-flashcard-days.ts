import { createServerFn } from "@tanstack/react-start";

import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { masteryScopeSchema } from "../schemas";
import { getDailyFlashcardDays } from "../service/study-stats";
import type { DailyFlashcardDay } from "../types";

export const getFlashcardDaysFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.inputValidator(masteryScopeSchema)
	.handler(
		({ data, context }): Promise<DailyFlashcardDay[]> =>
			context.user ? getDailyFlashcardDays(context.user.id, data) : Promise.resolve([])
	);
