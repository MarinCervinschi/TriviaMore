import { useState } from "react";

export const PAGED_LIST_SIZE = 20;

/**
 * Client-side paging for a list that already arrives whole. For a list the server
 * pages — search, the tables — the page belongs in the URL instead, so a link
 * carries it; here it is local on purpose, because these lists are read top-down
 * and nobody deep-links page four of their own notifications.
 *
 * The page is clamped rather than stored: deleting the last item of the last page
 * would otherwise leave the list showing an empty slice of itself.
 */
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
