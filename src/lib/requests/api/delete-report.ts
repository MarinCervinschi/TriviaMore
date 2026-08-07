import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { requestIdSchema } from "../schemas";
import { deleteReport } from "../service/user-requests";

export const deleteReportFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(requestIdSchema)
	.handler(({ data, context }) => deleteReport(context.user.id, data.id));
