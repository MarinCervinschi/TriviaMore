import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { listRuns } from "../service/runs";

export const listRunsFn = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return listRuns();
});
