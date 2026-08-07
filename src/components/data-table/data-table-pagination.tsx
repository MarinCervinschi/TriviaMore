import type { RowData } from "@tanstack/react-table";

import { Pagination } from "@/components/ui/pagination";

import type { DataTableInstance } from "./features";

export function DataTablePagination<TData extends RowData>({
	table,
}: {
	table: DataTableInstance<TData>;
}) {
	const { pageIndex, pageSize } = table.state.pagination;

	return (
		<Pagination
			page={pageIndex + 1}
			totalPages={table.getPageCount()}
			onPageChange={page => table.setPageIndex(page - 1)}
			totalItems={table.getRowCount()}
			pageSize={pageSize}
		/>
	);
}
