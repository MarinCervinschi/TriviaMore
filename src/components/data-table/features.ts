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
	filterFn_arrHas,
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

import type { Icon } from "@/components/icons";

import { facetFilterFn } from "./facet-filter";

export type DataTableAlign = "left" | "center" | "right";
export type DataTableBreakpoint = "sm" | "md" | "lg" | "xl";

export type DataTableFacetOption = {
	value: string;
	label: string;
	icon?: Icon;
};

export type DataTableColumnMeta = {
	label?: string;
	align?: DataTableAlign;
	hideBelow?: DataTableBreakpoint;
	headerClassName?: string;
	cellClassName?: string;
	facet?: { options: DataTableFacetOption[]; icon?: Icon };
};

export type DataTableMeta = {
	/** Clears search and facets in one navigation; separate resets would overwrite each other. */
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
		arrHas: filterFn_arrHas,
		facet: facetFilterFn,
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
