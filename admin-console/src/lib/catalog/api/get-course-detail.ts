import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireOwner } from "~/lib/auth/service";

import { getCourseDetail } from "../service";

export const getCourseDetailFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ id: z.string().uuid() }))
	.handler(async ({ data }) => {
		await requireOwner();
		return getCourseDetail(data.id);
	});
