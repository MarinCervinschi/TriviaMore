import { FlexRender } from "@tanstack/react-table";
import type { Header, RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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
			className={cn(
				"h-8 px-2 text-xs font-medium tracking-wider uppercase",
				ALIGN_CLASS[align]
			)}
			onClick={header.column.getToggleSortingHandler()}
		>
			<FlexRender header={header} />
			{sorted === "asc" ? (
				<ArrowUp className="h-3.5 w-3.5" />
			) : sorted === "desc" ? (
				<ArrowDown className="h-3.5 w-3.5" />
			) : (
				<ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
			)}
		</Button>
	);
}
