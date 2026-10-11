import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { listLatestRuns } from "../service/runs";

export const listLatestRunsFn = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return listLatestRuns();
});
