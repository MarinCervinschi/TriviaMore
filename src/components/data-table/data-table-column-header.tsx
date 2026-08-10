import { ArrowDownIcon } from "@solar-icons/react/linear/arrow-down";
import { ArrowUpIcon } from "@solar-icons/react/linear/arrow-up";
import { SortVerticalIcon } from "@solar-icons/react/linear/sort-vertical";
import { FlexRender } from "@tanstack/react-table";
import type { Header, RowData } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DataTableAlign, DataTableFeatures } from "./features";

const ALIGN_CLASS: Record<DataTableAlign, string> = {
	left: "-ml-2",
	center: "mx-auto",
	right: "ml-auto",
};

export function DataTableColumnHeader<TData extends RowData>({
	header,
	align = "left",
}: {
	header: Header<DataTableFeatures, TData, any>;
	align?: DataTableAlign;
}) {
	const sorted = header.column.getIsSorted();

	return (
		<Button
			variant="ghost"
			size="sm"
			className={cn("eyebrow h-8 px-2", ALIGN_CLASS[align])}
			onClick={header.column.getToggleSortingHandler()}
		>
			<FlexRender header={header} />
			{sorted === "asc" ? (
				<ArrowUpIcon className="h-3.5 w-3.5" />
			) : sorted === "desc" ? (
				<ArrowDownIcon className="h-3.5 w-3.5" />
			) : (
				<SortVerticalIcon className="h-3.5 w-3.5 opacity-40" />
			)}
		</Button>
	);
}
