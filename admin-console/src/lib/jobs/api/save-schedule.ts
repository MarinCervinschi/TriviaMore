import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { saveSchedule } from "../service/schedules";

export const saveScheduleFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			key: z.string().uuid().optional(),
			job: z.string(),
			cron: z.string().max(200),
			params: z.record(
				z.string(),
				z.union([z.string(), z.number(), z.boolean(), z.null()])
			),
			dryRun: z.boolean(),
		})
	)
	.handler(async ({ data }) => {
		const owner = await requireOwner();
		return saveSchedule(data, owner.userId);
	});
