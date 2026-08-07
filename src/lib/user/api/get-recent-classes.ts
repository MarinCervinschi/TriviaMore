import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/db";
import { optionalAuthMiddleware } from "@/lib/server/middleware/auth";

import { getRecentClasses } from "../service/classes";
import type { RecentClass } from "../types";

export const getRecentClassesFn = createServerFn({ method: "GET" })
	.middleware([optionalAuthMiddleware])
	.handler(
		({ context }): Promise<RecentClass[]> =>
			context.user ? getRecentClasses(getDb(), context.user.id) : Promise.resolve([])
	);
