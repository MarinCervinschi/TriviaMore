import { queryOptions } from "@tanstack/react-query";

import { getConnectionsFn } from "./api";

export const connectionQueries = {
	all: () =>
		queryOptions({
			queryKey: ["connections"],
			queryFn: () => getConnectionsFn(),
			staleTime: 0,
		}),
};
