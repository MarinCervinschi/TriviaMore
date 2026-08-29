import { type MouseEvent, useMemo, useRef, useState } from "react";

import { InlineEmpty } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { HEAT_EMPTY, HEAT_LEGEND, heatColor } from "./heat-scale";

export type CalendarDatum = {
	/** ISO day, `YYYY-MM-DD`. */
	date: string;
	value: number;
};

/** `"rolling"` = the last 12 months; a number = that whole calendar year. */
export type HeatmapView = "rolling" | number;

export type CalendarHeatmapProps = {
	/** All daily counts, any range. */
	data: CalendarDatum[];
	/** Which window to show. */
	view: HeatmapView;
	/** Last day of the rolling window. Defaults to the latest day in the data. */
	endDate?: string;
	unitLabel?: string;
	emptyMessage?: string;
	/**
	 * The card around the grid. Off when a parent card already provides one — two
	 * nested surfaces read as a seam, not as depth.
	 */
	className?: string;
};

const DAY_LABELS = ["Lun", "", "Mer", "", "Ven", "", "Dom"];
const MONTH_LABELS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"]; // prettier-ignore

const DAY_MS = 86_400_000;
const WEEKS = 53;

function weekdayIndex(date: Date): number {
	return (date.getUTCDay() + 6) % 7;
}

/** The calendar years the data has activity in, most recent first. */
export function heatmapYears(data: CalendarDatum[]): number[] {
	return [
		...new Set(data.filter(d => d.value > 0).map(d => Number(d.date.slice(0, 4)))),
	].sort((a, b) => b - a);
}

type Cell = { iso: string; value: number; month: number; inYear: boolean };

function ceilingOf(columns: Cell[][]) {
	return Math.max(...columns.flat().map(c => c.value), 1);
}

/** The rolling window of the last `WEEKS` weeks. */
function buildRolling(byDate: Map<string, number>, endIso: string) {
	const end = new Date(`${endIso}T00:00:00Z`);
	end.setUTCDate(end.getUTCDate() + (6 - weekdayIndex(end)));
	const start = new Date(end.getTime() - (WEEKS * 7 - 1) * DAY_MS);
	const columns: Cell[][] = [];
	for (let w = 0; w < WEEKS; w++) {
		const column: Cell[] = [];
		for (let d = 0; d < 7; d++) {
			const current = new Date(start.getTime() + (w * 7 + d) * DAY_MS);
			const iso = current.toISOString().slice(0, 10);
			column.push({
				iso,
				value: byDate.get(iso) ?? 0,
				month: current.getUTCMonth(),
				inYear: true,
			});
		}
		columns.push(column);
	}
	return { columns, ceiling: ceilingOf(columns) };
}

/**
 * A whole calendar year, Jan–Dec: always the full map, even the current year —
 * the days still to come are simply empty.
 */
function buildYear(byDate: Map<string, number>, year: number) {
	const end = new Date(`${year}-12-31T00:00:00Z`);
	end.setUTCDate(end.getUTCDate() + (6 - weekdayIndex(end)));
	const start = new Date(`${year}-01-01T00:00:00Z`);
	start.setUTCDate(start.getUTCDate() - weekdayIndex(start));
	const columns: Cell[][] = [];
	for (let t = start.getTime(); t <= end.getTime(); t += 7 * DAY_MS) {
		const column: Cell[] = [];
		for (let d = 0; d < 7; d++) {
			const current = new Date(t + d * DAY_MS);
			const iso = current.toISOString().slice(0, 10);
			const inYear = current.getUTCFullYear() === year;
			column.push({
				iso,
				value: inYear ? (byDate.get(iso) ?? 0) : 0,
				month: current.getUTCMonth(),
				inYear,
			});
		}
		columns.push(column);
	}
	return { columns, ceiling: ceilingOf(columns) };
}

type Tip = { left: number; top: number; label: string };

/**
 * The study-activity calendar: a week-per-column grid people already read as "how
 * consistently did I show up". Controlled by `view` — the caller owns the year
 * picker. Magnitude only: the ramp is sequential, never the categorical slots.
 */
export function CalendarHeatmap({
	data,
	view,
	endDate,
	unitLabel = "quiz",
	emptyMessage,
	className,
}: CalendarHeatmapProps) {
	const bodyRef = useRef<HTMLDivElement>(null);
	const [tip, setTip] = useState<Tip | null>(null);

	const byDate = useMemo(() => new Map(data.map(d => [d.date, d.value])), [data]);
	const rollEnd =
		endDate ??
		(data.length ? data.reduce((a, b) => (a.date > b.date ? a : b)).date : "");

	const model = useMemo(
		() =>
			view === "rolling" ? buildRolling(byDate, rollEnd) : buildYear(byDate, view),
		[byDate, view, rollEnd]
	);

	const total = useMemo(
		() =>
			model.columns.reduce(
				(sum, column) => sum + column.reduce((a, cell) => a + cell.value, 0),
				0
			),
		[model]
	);

	function showTip(event: MouseEvent<HTMLElement>, cell: Cell) {
		const box = bodyRef.current?.getBoundingClientRect();
		if (!box || !cell.inYear) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const [year, month, day] = cell.iso.split("-");
		const date = `${Number(day)} ${MONTH_LABELS[Number(month) - 1]} ${year}`;
		const count =
			cell.value === 0 ? `Nessun ${unitLabel}` : `${cell.value} ${unitLabel}`;
		setTip({
			left: rect.left - box.left + rect.width / 2,
			top: rect.top - box.top - 4,
			label: `${count} · ${date}`,
		});
	}

	if (data.length === 0) {
		return (
			<div className={className}>
				<InlineEmpty>{emptyMessage}</InlineEmpty>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"relative flex w-fit max-w-full flex-col justify-between overflow-hidden",
				className
			)}
		>
			<div ref={bodyRef} className="relative">
				<div className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<div className="flex min-w-max gap-2">
						<div className="text-muted-foreground text-2xs grid shrink-0 grid-rows-7 gap-[3px] pt-[18px]">
							{DAY_LABELS.map((label, i) => (
								<span key={i} className="flex h-3 items-center leading-none">
									{label}
								</span>
							))}
						</div>
						<div>
							<div className="text-muted-foreground text-2xs mb-1 flex gap-[3px]">
								{model.columns.map((column, index) => {
									const first = column.find(c => c.inYear) ?? column[0];
									const prev = model.columns[index - 1]?.find(c => c.inYear);
									const isNewMonth = !prev || prev.month !== first.month;
									return (
										<span key={column[0].iso} className="w-3 shrink-0">
											{isNewMonth && first.inYear ? MONTH_LABELS[first.month] : ""}
										</span>
									);
								})}
							</div>
							<div className="flex gap-[3px]">
								{model.columns.map(column => (
									<div key={column[0].iso} className="grid grid-rows-7 gap-[3px]">
										{column.map(cell => (
											<span
												key={cell.iso}
												aria-label={
													cell.inYear
														? `${cell.value} ${unitLabel} · ${cell.iso}`
														: undefined
												}
												onMouseEnter={event => showTip(event, cell)}
												onMouseLeave={() => setTip(null)}
												className={cn(
													"h-3 w-3 rounded-[3px] transition-colors",
													cell.inYear
														? "hover:ring-foreground/30 hover:ring-2"
														: "opacity-0"
												)}
												style={{
													backgroundColor: heatColor(cell.value, model.ceiling),
												}}
											/>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				{tip && (
					<div
						aria-hidden
						className="bg-popover text-popover-foreground text-2xs pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border px-2 py-1 font-medium whitespace-nowrap shadow-lg"
						style={{ left: tip.left, top: tip.top }}
					>
						{tip.label}
					</div>
				)}
			</div>
			<div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
				<span>
					<span className="text-foreground font-semibold">{total}</span> {unitLabel}
				</span>
				<div className="flex items-center gap-1.5">
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
			</div>
		</div>
	);
}
