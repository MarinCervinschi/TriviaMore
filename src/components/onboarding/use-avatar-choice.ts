import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { avatarQueries } from "@/lib/avatar/queries";
import type { AvatarChoice } from "@/lib/avatar/types";

/** The generated avatar picked so far, kept across pages so "Altri" does not lose its preview. */
export function useAvatarChoice({ enabled = true }: { enabled?: boolean } = {}) {
	const [page, setPage] = useState(0);
	const [chosen, setChosen] = useState<AvatarChoice | null>(null);

	const choices = useQuery({ ...avatarQueries.choices(page), enabled });

	return {
		chosen,
		clear: () => setChosen(null),
		chooserProps: {
			choices: choices.data ?? [],
			selectedSeed: chosen?.seed ?? null,
			onSelect: setChosen,
			onShuffle: () => setPage(current => current + 1),
			isLoading: choices.isFetching,
		},
	};
}
