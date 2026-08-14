import { type MouseEvent, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { HEAT_EMPTY, HEAT_LEGEND, heatColor } from "./heat-scale";

export type CalendarDatum = {
	/** ISO day, `YYYY-MM-DD`. */
	date: string;
	value: number;
};

export type CalendarHeatmapProps = {
	/** All daily counts, any range — the picker slices it per year. */
	data: CalendarDatum[];
	/** Last day of the rolling window. Defaults to the latest day in the data. */
	endDate?: string;
	/** Section heading, above the count line. */
	title?: string;
	unitLabel?: string;
	emptyMessage?: string;
	className?: string;
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
const WEEKS = 53;

/** Monday-based weekday index, so the grid starts on Monday like an Italian calendar. */
function weekdayIndex(date: Date): number {
	return (date.getUTCDay() + 6) % 7;
}

type Cell = { iso: string; value: number; month: number; inYear: boolean };

function summarise(columns: Cell[][]) {
	let total = 0;
	for (const cell of columns.flat()) {
		if (cell.inYear) total += cell.value;
	}
	const ceiling = Math.max(...columns.flat().map(c => c.value), 1);
	return { columns, ceiling, total };
}

/** The rolling window of the last `WEEKS` weeks — the no-filter default. */
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
	return summarise(columns);
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
	return summarise(columns);
}

type Tip = { left: number; top: number; label: string };

/**
 * The study-activity calendar: a week-per-column grid people already read as "how
 * consistently did I show up". Default is the rolling last-12-months window; the
 * year picker (only years with activity) shows a full Jan–Dec calendar. Magnitude
 * only — the ramp is sequential, never the categorical slots.
 */
export function CalendarHeatmap({
	data,
	endDate,
	title,
	unitLabel = "quiz",
	emptyMessage,
	className,
}: CalendarHeatmapProps) {
	const bodyRef = useRef<HTMLDivElement>(null);
	const [tip, setTip] = useState<Tip | null>(null);
	const [view, setView] = useState<"rolling" | number>("rolling");

	const byDate = useMemo(() => new Map(data.map(d => [d.date, d.value])), [data]);

	const years = useMemo(
		() =>
			[
				...new Set(data.filter(d => d.value > 0).map(d => Number(d.date.slice(0, 4)))),
			].sort((a, b) => b - a),
		[data]
	);

	const rollEnd =
		endDate ??
		(data.length ? data.reduce((a, b) => (a.date > b.date ? a : b)).date : "");

	const model = useMemo(
		() =>
			view === "rolling" ? buildRolling(byDate, rollEnd) : buildYear(byDate, view),
		[byDate, view, rollEnd]
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
				{title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
				<Card className="mt-2 p-6">
					<InlineEmpty>{emptyMessage}</InlineEmpty>
				</Card>
			</div>
		);
	}

	return (
		<div className={className}>
			{title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
			<p className="text-muted-foreground mt-0.5 mb-3 text-sm">
				<span className="text-foreground font-medium">
					{model.total} {unitLabel}
				</span>{" "}
				{view === "rolling" ? "negli ultimi 12 mesi" : `nel ${view}`}
			</p>

			<div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
				<Card className="relative w-fit max-w-full overflow-hidden p-6">
					<div ref={bodyRef} className="relative">
						<div className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

					<div className="text-muted-foreground mt-4 flex items-center justify-end gap-1.5 text-xs">
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
				</Card>

				{years.length > 0 && (
					<div className="relative shrink-0 lg:w-16">
						<div className="flex flex-col gap-1 overflow-y-auto [scrollbar-width:none] lg:absolute lg:inset-0 [&::-webkit-scrollbar]:hidden">
							{years.map(y => (
								<button
									key={y}
									type="button"
									onClick={() => setView(view === y ? "rolling" : y)}
									className={cn(
										"rounded-md px-3 py-1 text-left text-sm transition-colors",
										view === y
											? "bg-primary/10 text-brand font-medium"
											: "text-muted-foreground hover:bg-muted"
									)}
								>
									{y}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
