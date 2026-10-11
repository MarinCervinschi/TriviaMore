import { createServerFn } from "@tanstack/react-start";

import { requireOwner } from "~/lib/auth/service";

import { getCatalogCourses } from "../service";

export const getCatalogCoursesFn = createServerFn({ method: "GET" }).handler(
	async () => {
		await requireOwner();
		return getCatalogCourses();
	}
);
