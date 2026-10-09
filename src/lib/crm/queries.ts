import { queryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/shared/cache";

import {
	getCalendarFn,
	getCareerFn,
	getCurrentEnrollmentFn,
	getCurriculumOptionsFn,
} from "./api";

export const crmQueries = {
	currentEnrollment: () =>
		queryOptions({
			queryKey: ["crm", "current-enrollment"],
			queryFn: () => getCurrentEnrollmentFn(),
			staleTime: STALE_TIME.STANDARD,
		}),
	curriculumOptions: (courseId: string, startYear: number) =>
		queryOptions({
			queryKey: ["crm", "curriculum-options", courseId, startYear],
			queryFn: () => getCurriculumOptionsFn({ data: { courseId, startYear } }),
			staleTime: STALE_TIME.STANDARD,
		}),
	career: () =>
		queryOptions({
			queryKey: ["crm", "career"],
			queryFn: () => getCareerFn(),
			staleTime: STALE_TIME.STANDARD,
		}),
	calendar: () =>
		queryOptions({
			queryKey: ["crm", "calendar"],
			queryFn: () => getCalendarFn(),
			staleTime: STALE_TIME.STANDARD,
		}),
};
