import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { setSchedulePaused } from "../service/schedules";

export const setSchedulePausedFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			key: z.union([z.string().uuid(), z.literal("all")]),
			paused: z.boolean(),
		})
	)
	.handler(async ({ data }) => {
		await requireOwner();
		return setSchedulePaused(data.key, data.paused);
	});
