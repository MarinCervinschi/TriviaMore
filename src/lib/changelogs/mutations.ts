import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markChangelogsReadFn } from "./api";
import type { MarkChangelogsReadInput } from "./schemas";

export function useMarkChangelogsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: MarkChangelogsReadInput) => markChangelogsReadFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["changelogs", "unreadVersions"],
			});
		},
	});
}
