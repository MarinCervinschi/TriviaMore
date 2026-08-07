import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { markChangelogsReadSchema } from "../schemas";
import { markVersionsRead } from "../service";

export const markChangelogsReadFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(markChangelogsReadSchema)
	.handler(({ data, context }) => markVersionsRead(context.user.id, data.versions));
