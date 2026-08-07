export type SortState<T> = {
	key: keyof T | null;
	direction: "asc" | "desc";
};

// Client-side filter + sort + paginate over an in-memory list. Not a UI
// primitive — it belongs with the hooks, not in components/ui.
export function usePaginatedSearch<T>(
	items: T[],
	searchFn: (item: T, query: string) => boolean,
	search: string,
	page: number,
	pageSize: number = 10,
	sort?: SortState<T>
) {
	let filtered = search
		? items.filter(item => searchFn(item, search.toLowerCase()))
		: [...items];

	if (sort?.key) {
		const key = sort.key;
		const dir = sort.direction === "asc" ? 1 : -1;
		filtered = [...filtered].sort((a, b) => {
			const aVal = a[key];
			const bVal = b[key];
			if (aVal == null && bVal == null) return 0;
			if (aVal == null) return dir;
			if (bVal == null) return -dir;
			if (typeof aVal === "string" && typeof bVal === "string")
				return aVal.localeCompare(bVal) * dir;
			if (typeof aVal === "number" && typeof bVal === "number")
				return (aVal - bVal) * dir;
			if (typeof aVal === "boolean" && typeof bVal === "boolean")
				return (Number(aVal) - Number(bVal)) * dir;
			return String(aVal).localeCompare(String(bVal)) * dir;
		});
	}

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

	return { paged, filtered, totalPages, safePage, totalItems: filtered.length };
}
