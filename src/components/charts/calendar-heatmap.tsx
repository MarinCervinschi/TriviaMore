import { useMemo } from "react";

import { InlineEmpty } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { ChartCard, type ChartCardProps } from "./chart-card";
import { HEAT_EMPTY, HEAT_LEGEND, heatColor } from "./heat-scale";

export type CalendarDatum = {
	/** ISO day, `YYYY-MM-DD`. */
	date: string;
	value: number;
};

export type CalendarHeatmapProps = Omit<ChartCardProps, "children"> & {
	data: CalendarDatum[];
	/** Last day shown. Defaults to the latest day in the data, so it is SSR-stable. */
	endDate?: string;
	weeks?: number;
	/** Top of the colour scale. Defaults to the highest value in the data. */
	max?: number;
	unitLabel?: string;
	emptyMessage?: string;
};

const DAY_LABELS = ["Lun", "", "Mer", "", "Ven", "", "Dom"];
const MONTH_LABELS = [
	"gen",
	"feb",
	"mar",
	"apr",
	"mag",
	"giu",
	"lug",
	"ago",
	"set",
	"ott",
	"nov",
	"dic",
];

const DAY_MS = 86_400_000;

function toIso(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Monday-based weekday index, so the grid starts on Monday like an Italian calendar. */
function weekdayIndex(date: Date): number {
	return (date.getUTCDay() + 6) % 7;
}

/**
 * A year of days as a week-per-column grid: the shape people already read as
 * "how consistently did I show up". Magnitude only — the ramp is sequential.
 */
export function CalendarHeatmap({
	data,
	endDate,
	weeks = 53,
	max,
	unitLabel = "quiz",
	emptyMessage,
	...card
}: CalendarHeatmapProps) {
	const grid = useMemo(() => {
		if (data.length === 0) return null;

		const byDate = new Map(data.map(entry => [entry.date, entry.value]));
		const last = endDate ?? data.reduce((a, b) => (a.date > b.date ? a : b)).date;
		const end = new Date(`${last}T00:00:00Z`);
		// Close the final column so the last week is whole.
		end.setUTCDate(end.getUTCDate() + (6 - weekdayIndex(end)));
		const start = new Date(end.getTime() - (weeks * 7 - 1) * DAY_MS);

		const columns: { iso: string; value: number; month: number; day: number }[][] = [];
		for (let w = 0; w < weeks; w++) {
			const column = [];
			for (let d = 0; d < 7; d++) {
				const current = new Date(start.getTime() + (w * 7 + d) * DAY_MS);
				const iso = toIso(current);
				column.push({
					iso,
					value: byDate.get(iso) ?? 0,
					month: current.getUTCMonth(),
					day: current.getUTCDate(),
				});
			}
			columns.push(column);
		}

		const ceiling = max ?? Math.max(...data.map(entry => entry.value), 1);
		return { columns, ceiling };
	}, [data, endDate, weeks, max]);

	if (!grid) {
		return (
			<ChartCard {...card}>
				<InlineEmpty>{emptyMessage}</InlineEmpty>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			{...card}
			footer={
				<div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs">
					<span>Meno</span>
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
					<span>Più</span>
				</div>
			}
		>
			<div className="overflow-x-auto">
				<div className="flex min-w-max gap-2">
					<div className="text-muted-foreground text-2xs grid shrink-0 grid-rows-7 gap-[3px] pt-[18px]">
						{DAY_LABELS.map((label, index) => (
							<span key={index} className="flex h-3 items-center leading-none">
								{label}
							</span>
						))}
					</div>

					<div>
						<div className="text-muted-foreground text-2xs mb-1 flex gap-[3px]">
							{grid.columns.map((column, index) => {
								const first = column[0];
								const previous = grid.columns[index - 1]?.[0];
								const isNewMonth = !previous || previous.month !== first.month;
								return (
									<span key={first.iso} className="w-3 shrink-0">
										{isNewMonth ? MONTH_LABELS[first.month] : ""}
									</span>
								);
							})}
						</div>
						<div className="flex gap-[3px]">
							{grid.columns.map(column => (
								<div key={column[0].iso} className="grid grid-rows-7 gap-[3px]">
									{column.map(cell => (
										<span
											key={cell.iso}
											// The native tooltip is the hover layer here: 371 cells do not
											// each deserve a portal, and it stays available to the keyboard.
											title={`${cell.iso} — ${cell.value} ${unitLabel}`}
											className={cn(
												"h-3 w-3 rounded-[3px] transition-colors",
												"hover:ring-foreground/30 hover:ring-2"
											)}
											style={{ backgroundColor: heatColor(cell.value, grid.ceiling) }}
										/>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</ChartCard>
	);
}
