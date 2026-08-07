import {
	columnFacetingFeature,
	columnFilteringFeature,
	columnVisibilityFeature,
	createColumnHelper,
	createFacetedRowModel,
	createFacetedUniqueValues,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_arrIncludesSome,
	filterFn_includesString,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
} from "@tanstack/react-table";
import type { ColumnDef, ReactTable, RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

export type DataTableAlign = "left" | "center" | "right";
export type DataTableBreakpoint = "sm" | "md" | "lg" | "xl";

export type DataTableFacetOption = {
	value: string;
	label: string;
	icon?: LucideIcon;
};

export type DataTableColumnMeta = {
	/** Human-readable name for the filter and column-visibility menus. */
	label?: string;
	align?: DataTableAlign;
	/** Hides header and cells together below this breakpoint. */
	hideBelow?: DataTableBreakpoint;
	headerClassName?: string;
	cellClassName?: string;
	/** Turns the column into a multi-select filter in the toolbar. */
	facet?: { options: DataTableFacetOption[] };
};

export type DataTableMeta = {
	/**
	 * Clears the search box and every faceted filter at once. The toolbar cannot
	 * call the per-slice reset APIs instead: with URL-backed state each of them
	 * would issue its own navigation, and the later one would overwrite the first.
	 */
	resetFilters: () => void;
};

export const dataTableFeatures = tableFeatures({
	columnFacetingFeature,
	columnFilteringFeature,
	columnVisibilityFeature,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
	facetedRowModel: createFacetedRowModel(),
	facetedUniqueValues: createFacetedUniqueValues(),
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	filterFns: {
		arrIncludesSome: filterFn_arrIncludesSome,
		includesString: filterFn_includesString,
	},
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
	columnMeta: {} as DataTableColumnMeta,
	tableMeta: {} as DataTableMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumn<TData extends RowData> = ColumnDef<
	DataTableFeatures,
	TData,
	any
>;

export type DataTableInstance<TData extends RowData> = ReactTable<
	DataTableFeatures,
	TData
>;

export function createDataTableColumns<TData extends RowData>() {
	return createColumnHelper<DataTableFeatures, TData>();
}
