import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	totalItems: number;
	pageSize: number;
};

export function Pagination({
	page,
	totalPages,
	onPageChange,
	totalItems,
	pageSize,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const from = (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, totalItems);

	return (
		<div className="flex items-center justify-between pt-4">
			<p className="text-muted-foreground text-sm">
				{from}–{to} di {totalItems}
			</p>
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 rounded-xl"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				{Array.from({ length: totalPages }, (_, i) => i + 1)
					.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
					.reduce<(number | "...")[]>((acc, p, i, arr) => {
						if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("...");
						acc.push(p);
						return acc;
					}, [])
					.map((p, i) =>
						p === "..." ? (
							<span key={`dots-${i}`} className="text-muted-foreground px-1 text-sm">
								...
							</span>
						) : (
							<Button
								key={p}
								variant={p === page ? "default" : "outline"}
								size="icon"
								className="h-8 w-8 rounded-xl"
								onClick={() => onPageChange(p)}
							>
								{p}
							</Button>
						)
					)}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 rounded-xl"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
