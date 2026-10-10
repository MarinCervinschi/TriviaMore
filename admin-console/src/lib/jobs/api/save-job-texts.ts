import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { saveJobTexts } from "../service/jobs";

export const saveJobTextsFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			job: z.string(),
			label: z.string().max(80),
			description: z.string().max(400),
		})
	)
	.handler(async ({ data }) => {
		const owner = await requireOwner();
		return saveJobTexts(data, owner.userId);
	});
