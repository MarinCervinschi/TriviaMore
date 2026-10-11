import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { prefillCareer } from "../service/career";

export const prefillCareerFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(({ context }) => prefillCareer(context.user.id));
