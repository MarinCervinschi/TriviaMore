import { type ReactNode, useMemo, useState } from "react";

import { InlineEmpty } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { AttemptRow } from "@/lib/quiz/results";

type Filter = "todo" | "all" | "correct";

export function ReviewList({
	rows,
	renderItem,
}: {
	rows: AttemptRow[];
	renderItem: (row: AttemptRow, index: number, open: boolean) => ReactNode;
}) {
	const counts = useMemo(
		() => ({
			all: rows.length,
			correct: rows.filter(row => row.verdict === "correct").length,
			todo: rows.filter(row => row.verdict !== "correct").length,
		}),
		[rows]
	);

	const [filter, setFilter] = useState<Filter>(counts.todo > 0 ? "todo" : "all");

	// The index travels with the row, so a filtered list keeps the quiz's numbering.
	const shown = useMemo(() => {
		const numbered = rows.map((row, index) => ({ row, index }));
		if (filter === "all") return numbered;
		const wanted = filter === "correct";
		return numbered.filter(entry => (entry.row.verdict === "correct") === wanted);
	}, [rows, filter]);

	return (
		<section className="space-y-3.5">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-xl font-bold tracking-tight">Revisione domande</h2>
				<SegmentedControl
					label="Filtra le domande"
					value={filter}
					onChange={setFilter}
					options={[
						{ value: "todo", label: "Da rivedere", count: counts.todo },
						{ value: "all", label: "Tutte", count: counts.all },
						{ value: "correct", label: "Corrette", count: counts.correct },
					]}
				/>
			</div>

			{shown.length === 0 ? (
				<InlineEmpty>Nessuna domanda in questo filtro.</InlineEmpty>
			) : (
				<div className="space-y-3">
					{shown.map((entry, position) =>
						renderItem(entry.row, entry.index, position === 0 && filter === "todo")
					)}
				</div>
			)}
		</section>
	);
}
