import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { previewCron } from "../service/schedules";

export const previewCronFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ cron: z.string().max(200) }))
	.handler(async ({ data }) => {
		await requireOwner();
		return previewCron(data.cron);
	});
