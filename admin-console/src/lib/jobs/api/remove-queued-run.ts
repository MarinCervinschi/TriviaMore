import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { removeQueuedRun } from "../service";

export const removeQueuedRunFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string().uuid() }))
	.handler(async ({ data }) => {
		await requireOwner();
		return removeQueuedRun(data.id);
	});
