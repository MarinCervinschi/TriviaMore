import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { listJobRuns } from "../service/runs";

export const listJobRunsFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ job: z.string().min(1) }))
	.handler(async ({ data }) => {
		await requireOwner();
		return listJobRuns(data.job);
	});
