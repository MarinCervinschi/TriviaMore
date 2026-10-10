import { queryOptions } from "@tanstack/react-query";

import { getConnectionFn } from "./api";

export const connectionQueries = {
	status: () =>
		queryOptions({
			queryKey: ["connection"],
			queryFn: () => getConnectionFn(),
			staleTime: 0,
		}),
};
