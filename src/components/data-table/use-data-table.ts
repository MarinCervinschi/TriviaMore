import { useCallback, useMemo, useState } from "react";

import { functionalUpdate, useTable } from "@tanstack/react-table";
import type {
	ColumnFiltersState,
	ColumnVisibilityState,
	FilterFn,
	OnChangeFn,
	PaginationState,
	RowData,
	SortingState,
} from "@tanstack/react-table";

import { dataTableFeatures } from "./features";
import type { DataTableColumn, DataTableFeatures, DataTableInstance } from "./features";

export const DATA_TABLE_PAGE_SIZE = 10;

/**
 * The search params every data table understands. A route adds one extra
 * `string` key per faceted column, named after the column id.
 */
export type DataTableSearch = {
	q?: string;
	page?: number;
	sort?: string;
	dir?: "asc" | "desc";
};

export type DataTableUrlState<TSearch extends DataTableSearch> = {
	values: TSearch;
	onChange: (patch: Partial<TSearch>) => void;
};

type SearchBag = DataTableSearch & Record<string, unknown>;
type SearchPatch = Record<string, string | number | undefined>;

export type UseDataTableOptions<
	TData extends RowData,
	TSearch extends DataTableSearch,
> = {
	data: TData[];
	columns: DataTableColumn<TData>[];
	pageSize?: number;
	getRowId?: (row: TData, index: number) => string;
	initialSorting?: SortingState;
	initialColumnVisibility?: ColumnVisibilityState;
	/** Row-level search predicate, for when one query has to match several fields. */
	searchFn?: (row: TData, query: string) => boolean;
	/** Mirrors state into the route's search params instead of component state. */
	urlState?: DataTableUrlState<TSearch>;
	/** Server-driven table: the caller pages, sorts and filters, and reports the totals. */
	manual?: { pageCount: number; rowCount: number };
};

function columnIdOf(column: DataTableColumn<any>): string | undefined {
	const candidate = column as { id?: string; accessorKey?: string | number };
	if (candidate.id) return candidate.id;
	if (candidate.accessorKey != null) return String(candidate.accessorKey);
	return undefined;
}

export function useDataTable<
	TData extends RowData,
	TSearch extends DataTableSearch = DataTableSearch,
>({
	data,
	columns,
	pageSize = DATA_TABLE_PAGE_SIZE,
	getRowId,
	initialSorting,
	initialColumnVisibility,
	searchFn,
	urlState,
	manual,
}: UseDataTableOptions<TData, TSearch>): DataTableInstance<TData> {
	const [localSearch, setLocalSearch] = useState<SearchBag>({});
	const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
		initialColumnVisibility ?? {}
	);

	const search: SearchBag = urlState ? (urlState.values as SearchBag) : localSearch;

	const onChange = urlState?.onChange;
	const patch = useCallback(
		(next: SearchPatch) => {
			if (onChange) onChange(next as Partial<TSearch>);
			else setLocalSearch(prev => ({ ...prev, ...next }));
		},
		[onChange]
	);

	const facetColumnIds = useMemo(
		() =>
			columns.flatMap(column => {
				const id = column.meta?.facet ? columnIdOf(column) : undefined;
				return id ? [id] : [];
			}),
		[columns]
	);

	const sorting = useMemo<SortingState>(
		() =>
			search.sort
				? [{ id: search.sort, desc: search.dir === "desc" }]
				: (initialSorting ?? []),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[search.sort, search.dir, initialSorting]
	);

	const pagination = useMemo<PaginationState>(
		() => ({ pageIndex: Math.max(0, (search.page ?? 1) - 1), pageSize }),
		[search.page, pageSize]
	);

	const columnFilters = useMemo<ColumnFiltersState>(
		() =>
			facetColumnIds.flatMap(id => {
				const raw = search[id];
				return typeof raw === "string" && raw !== ""
					? [{ id, value: raw.split(",") }]
					: [];
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[facetColumnIds, ...facetColumnIds.map(id => search[id])]
	);

	const globalFilter = search.q ?? "";

	const onSortingChange = useCallback<OnChangeFn<SortingState>>(
		updater => {
			const [first] = functionalUpdate(updater, sorting);
			patch({
				sort: first?.id,
				dir: first ? (first.desc ? "desc" : "asc") : undefined,
				page: undefined,
			});
		},
		[patch, sorting]
	);

	const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
		updater => {
			const next = functionalUpdate(updater, pagination);
			patch({ page: next.pageIndex === 0 ? undefined : next.pageIndex + 1 });
		},
		[patch, pagination]
	);

	const onGlobalFilterChange = useCallback<OnChangeFn<any>>(
		updater => {
			const next = String(functionalUpdate(updater, globalFilter) ?? "");
			patch({ q: next || undefined, page: undefined });
		},
		[patch, globalFilter]
	);

	const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
		updater => {
			const next = functionalUpdate(updater, columnFilters);
			const cleared: SearchPatch = Object.fromEntries(
				facetColumnIds.map(id => [id, undefined])
			);
			for (const filter of next) {
				const values = Array.isArray(filter.value) ? filter.value : [filter.value];
				cleared[filter.id] = values.length ? values.join(",") : undefined;
			}
			patch({ ...cleared, page: undefined });
		},
		[patch, columnFilters, facetColumnIds]
	);

	const resetFilters = useCallback(() => {
		const cleared: SearchPatch = Object.fromEntries(
			facetColumnIds.map(id => [id, undefined])
		);
		patch({ ...cleared, q: undefined, page: undefined });
	}, [patch, facetColumnIds]);

	const globalFilterFn = useMemo<FilterFn<DataTableFeatures, TData> | "includesString">(
		() =>
			searchFn
				? (row, _columnId, filterValue) => {
						const query = String(filterValue ?? "")
							.trim()
							.toLowerCase();
						return query === "" ? true : searchFn(row.original, query);
					}
				: "includesString",
		[searchFn]
	);

	return useTable({
		features: dataTableFeatures,
		data,
		columns,
		getRowId,
		globalFilterFn,
		meta: { resetFilters },
		// Toggling a header cycles asc/desc without a third "unsorted" step, so a
		// table with a default sort can never end up in a state the URL cannot express.
		enableSortingRemoval: false,
		manualPagination: Boolean(manual),
		manualSorting: Boolean(manual),
		manualFiltering: Boolean(manual),
		pageCount: manual?.pageCount,
		rowCount: manual?.rowCount,
		state: { sorting, pagination, globalFilter, columnFilters, columnVisibility },
		onSortingChange,
		onPaginationChange,
		onGlobalFilterChange,
		onColumnFiltersChange,
		onColumnVisibilityChange: setColumnVisibility,
	});
}
