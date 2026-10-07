import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { probeConnections } from "../service";

export const getConnectionsFn = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return probeConnections();
});
