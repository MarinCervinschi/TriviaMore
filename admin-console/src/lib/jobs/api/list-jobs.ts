import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { listJobs } from "../service/runs";

export const listJobsFn = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return listJobs();
});
