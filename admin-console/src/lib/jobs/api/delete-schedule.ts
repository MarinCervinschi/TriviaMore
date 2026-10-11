import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { deleteSchedule } from "../service/schedules";

export const deleteScheduleFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ key: z.string().uuid() }))
	.handler(async ({ data }) => {
		await requireOwner();
		return deleteSchedule(data.key);
	});
