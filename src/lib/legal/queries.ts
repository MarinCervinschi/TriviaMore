import { queryOptions } from "@tanstack/react-query";

import { getAcceptanceStatusFn } from "./api";

export const legalQueries = {
	acceptanceStatus: () =>
		queryOptions({
			queryKey: ["legal", "acceptance-status"],
			queryFn: () => getAcceptanceStatusFn(),
		}),
};
