import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { updateQueuedRun } from "../service/runs";

export const updateQueuedRunFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.string().uuid(),
			params: z.record(
				z.string(),
				z.union([z.string(), z.number(), z.boolean(), z.null()])
			),
			dryRun: z.boolean(),
		})
	)
	.handler(async ({ data }) => {
		await requireOwner();
		return updateQueuedRun(data);
	});
