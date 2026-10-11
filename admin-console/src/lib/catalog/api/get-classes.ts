import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { getCatalogClasses } from "../service";

export const getCatalogClassesFn = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireOwner();
		return getCatalogClasses();
	}
);
