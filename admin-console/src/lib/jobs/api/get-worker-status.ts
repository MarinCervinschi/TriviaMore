import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { getWorkerStatus } from "../service";

export const getWorkerStatusFn = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return getWorkerStatus();
});
