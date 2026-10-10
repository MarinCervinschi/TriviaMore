import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { getCatalogOverview } from "../service";

export const getCatalogOverviewFn = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireOwner();
		return getCatalogOverview();
	}
);
