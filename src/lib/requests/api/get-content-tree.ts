import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getContentTree } from "../service/content-tree";

export const getContentTreeForRequestsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => getContentTree(context.user.id));
