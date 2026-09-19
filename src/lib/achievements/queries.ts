import { queryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/shared/cache";

import { getAchievementsFn } from "./api";

export const achievementQueries = {
	all: () =>
		queryOptions({
			queryKey: ["achievements"],
			queryFn: () => getAchievementsFn(),
			staleTime: STALE_TIME.STANDARD,
		}),
};
