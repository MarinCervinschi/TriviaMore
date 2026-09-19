import { queryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/shared/cache";

import { getCurrentEnrollmentFn } from "./api";

export const crmQueries = {
	currentEnrollment: () =>
		queryOptions({
			queryKey: ["crm", "current-enrollment"],
			queryFn: () => getCurrentEnrollmentFn(),
			staleTime: STALE_TIME.STANDARD,
		}),
};
