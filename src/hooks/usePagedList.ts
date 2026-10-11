import { useState } from "react";

export const PAGED_LIST_SIZE = 20;

/** Client-side paging for a list that arrives whole; the page is clamped to the last one. */
export function usePagedList<T>(items: T[], pageSize = PAGED_LIST_SIZE) {
	const [wanted, setPage] = useState(1);

	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	const page = Math.min(wanted, totalPages);

	return {
		page,
		setPage,
		totalPages,
		pageSize,
		total: items.length,
		items: items.slice((page - 1) * pageSize, page * pageSize),
	};
}
