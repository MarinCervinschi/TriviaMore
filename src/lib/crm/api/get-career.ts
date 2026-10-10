import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { getCareer } from "../service/career";

export const getCareerFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(({ context }) => getCareer(context.user.id));
