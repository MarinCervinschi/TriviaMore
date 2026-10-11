import { queryOptions } from "@tanstack/react-query";

import {
	getCatalogClassesFn,
	getCatalogCoursesFn,
	getCatalogOverviewFn,
	getClassDetailFn,
	getCourseDetailFn,
} from "./api";

export const catalogQueries = {
	overview: () =>
		queryOptions({
			queryKey: ["catalog", "overview"],
			queryFn: () => getCatalogOverviewFn(),
		}),
	courses: () =>
		queryOptions({
			queryKey: ["catalog", "courses"],
			queryFn: () => getCatalogCoursesFn(),
		}),
	classes: () =>
		queryOptions({
			queryKey: ["catalog", "classes"],
			queryFn: () => getCatalogClassesFn(),
		}),
	classDetail: (id: string) =>
		queryOptions({
			queryKey: ["catalog", "classes", id],
			queryFn: () => getClassDetailFn({ data: { id } }),
		}),
	courseDetail: (id: string) =>
		queryOptions({
			queryKey: ["catalog", "courses", id],
			queryFn: () => getCourseDetailFn({ data: { id } }),
		}),
};
