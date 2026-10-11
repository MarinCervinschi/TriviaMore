import { queryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/shared/cache";

import { getAvatarChoicesFn } from "./api";

export const avatarQueries = {
	choices: (page: number) =>
		queryOptions({
			queryKey: ["avatar", "choices", page],
			queryFn: () => getAvatarChoicesFn({ data: { page } }),
			staleTime: STALE_TIME.SLOW,
		}),
};
