import { formatNumber } from "@/lib/utils/format";

import { ChartCard, type ChartCardProps, ChartEmpty } from "./chart-card";
import { HEAT_EMPTY, HEAT_LEGEND, heatColor } from "./heat-scale";

const cellKey = (row: string, column: string) => `${row}\u0000${column}`;

export type MatrixCell = {
	row: string;
	column: string;
	value: number;
};

export type MatrixHeatmapProps = Omit<ChartCardProps, "children"> & {
	rows: string[];
	columns: string[];
	cells: MatrixCell[];
	/** Top of the colour scale. Defaults to the highest value present. */
	max?: number;
	unitLabel?: string;
	valueFormatter?: (value: number) => string;
	emptyMessage?: string;
};

/**
 * Two categorical axes and one magnitude — "which section is hard at which
 * difficulty", "which hour of which day gets studied". The ramp is sequential,
 * so the cell colour reads as more-or-less, never as a category.
 */
export function MatrixHeatmap({
	rows,
	columns,
	cells,
	max,
	unitLabel = "",
	valueFormatter,
	emptyMessage,
	...card
}: MatrixHeatmapProps) {
	if (rows.length === 0 || columns.length === 0) {
		return (
			<ChartCard {...card}>
				<ChartEmpty message={emptyMessage} />
			</ChartCard>
		);
	}

	// Row and column labels are arbitrary text, so the key separator has to be a
	// character they cannot contain.
	const byCell = new Map(
		cells.map(cell => [cellKey(cell.row, cell.column), cell.value])
	);
	const ceiling = max ?? Math.max(...cells.map(cell => cell.value), 1);
	const format = valueFormatter ?? ((value: number) => formatNumber(value));

	return (
		<ChartCard
			{...card}
			footer={
				<div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs">
					<span>0</span>
					<span
						className="h-3 w-3 rounded-[3px]"
						style={{ backgroundColor: HEAT_EMPTY }}
					/>
					{HEAT_LEGEND.map(step => (
						<span
							key={step}
							className="h-3 w-3 rounded-[3px]"
							style={{ backgroundColor: step }}
						/>
					))}
					<span>{format(ceiling)}</span>
				</div>
			}
		>
			<div className="overflow-x-auto">
				<table className="w-full min-w-max border-separate border-spacing-[3px] text-xs">
					<thead>
						<tr>
							<th />
							{columns.map(column => (
								<th
									key={column}
									scope="col"
									className="text-muted-foreground px-1 pb-1 text-center font-medium whitespace-nowrap"
								>
									{column}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map(row => (
							<tr key={row}>
								<th
									scope="row"
									className="text-muted-foreground max-w-[12rem] truncate pr-2 text-right font-medium"
								>
									{row}
								</th>
								{columns.map(column => {
									const value = byCell.get(cellKey(row, column)) ?? 0;
									return (
										<td key={column} className="p-0">
											<span
												title={`${row} · ${column} — ${format(value)} ${unitLabel}`.trim()}
												className="hover:ring-foreground/30 block h-8 min-w-8 rounded-[4px] transition-colors hover:ring-2"
												style={{ backgroundColor: heatColor(value, ceiling) }}
											/>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</ChartCard>
	);
}
