import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { getSchedulerOverview } from "../service/schedules";

export const getSchedulerOverviewFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ window: z.enum(["day", "week"]) }))
	.handler(async ({ data }) => {
		await requireOwner();
		return getSchedulerOverview(data.window);
	});
