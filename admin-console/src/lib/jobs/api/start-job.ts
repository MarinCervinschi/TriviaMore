import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { startJob } from "../service";

export const startJobFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			job: z.string(),
			params: z.record(
				z.string(),
				z.union([z.string(), z.number(), z.boolean(), z.null()])
			),
			dryRun: z.boolean(),
		})
	)
	.handler(async ({ data }) => {
		const owner = await requireOwner();
		return startJob(data, owner.userId);
	});
