import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { probeConnection } from "../service";

export const getConnectionFn = createServerFn({ method: "GET" }).handler(async () => {
	await requireOwner();
	return probeConnection();
});
