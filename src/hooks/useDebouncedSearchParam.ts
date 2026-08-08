import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";

/**
 * Keeps a text input responsive while its value lives in a search param: typing
 * updates local state, and only the settled value is pushed to the URL. External
 * changes (back/forward, a cleared filter) flow back into the input.
 */
export function useDebouncedSearchParam(
	value: string | undefined,
	onCommit: (next: string | undefined) => void,
	delay = 400
): [string, (next: string) => void] {
	const current = value ?? "";
	const [local, setLocal] = useState(current);
	const debounced = useDebounce(local, delay);

	useEffect(() => {
		if (debounced !== current) onCommit(debounced || undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced]);

	useEffect(() => {
		setLocal(current);
	}, [current]);

	return [local, setLocal];
}
