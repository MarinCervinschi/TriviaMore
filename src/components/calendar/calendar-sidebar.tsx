import { useMemo } from "react";

import { CalendarAddIcon } from "@solar-icons/react/linear/calendar-add";
import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";

import { PlusGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BUSY_DOT, busyDays, occurrencesOf } from "./calendar-adapter";
import { ENTRY_KINDS } from "./calendar-entry";
import {
	type CalendarEntry,
	type EntryKind,
	KIND_ORDER,
	addDays,
	daysBetween,
	formatDay,
} from "./calendar-model";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-2">
			<h2 className="eyebrow text-muted-foreground px-2">{title}</h2>
			{children}
		</section>
	);
}

/** The left column of the calendar: create, a month to jump with, the kinds to show, what comes next. */
export function CalendarSidebar({
	entries,
	date,
	today,
	hidden,
	showSessions,
	canAddSitting,
	onDate,
	onToggleKind,
	onToggleSessions,
	onCreate,
	onSelectEntry,
}: {
	entries: CalendarEntry[];
	date: Date;
	today: string;
	hidden: Set<EntryKind>;
	showSessions: boolean;
	canAddSitting: boolean;
	onDate: (date: Date) => void;
	onToggleKind: (kind: EntryKind) => void;
	onToggleSessions: () => void;
	onCreate: (kind: "event" | "sitting" | "task") => void;
	onSelectEntry: (entry: CalendarEntry) => void;
}) {
	const busy = useMemo(
		() =>
			busyDays(
				entries.filter(entry => !hidden.has(entry.kind)),
				date
			),
		[entries, hidden, date]
	);

	const counts = useMemo(() => {
		const map = new Map<EntryKind, number>();
		for (const entry of entries) map.set(entry.kind, (map.get(entry.kind) ?? 0) + 1);
		return map;
	}, [entries]);

	const next = useMemo(
		() =>
			entries
				.filter(entry => !hidden.has(entry.kind) && !entry.done)
				.flatMap(entry => occurrencesOf(entry, today, addDays(today, 366)))
				.filter(entry => (entry.endDate ?? entry.date) >= today)
				.sort(
					(a, b) =>
						a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
				)
				.slice(0, 5),
		[entries, hidden, today]
	);

	const kinds = Object.keys(KIND_ORDER) as EntryKind[];

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="shrink-0 pb-5">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="shadow-primary/25 self-start shadow-lg">
							<PlusGlyph className="size-4" />
							Crea
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuItem onSelect={() => onCreate("event")}>
							<CalendarAddIcon />
							Evento o nota
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => onCreate("task")}>
							<ChecklistMinimalisticIcon />
							Task
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={!canAddSitting}
							onSelect={() => onCreate("sitting")}
						>
							<NotebookIcon />
							Appello di un esame
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto pr-1 pb-4">
				<Calendar
					mode="single"
					selected={date}
					onSelect={day => day && onDate(day)}
					month={date}
					onMonthChange={onDate}
					weekStartsOn={1}
					modifiers={{ busy }}
					modifiersClassNames={{
						busy: BUSY_DOT,
					}}
					className="w-full p-0"
				/>

				<Section title="Mostra">
					<ul className="flex flex-col">
						{kinds.map(kind => {
							const def = ENTRY_KINDS[kind];
							const id = `calendar-kind-${kind}`;
							return (
								<li key={kind}>
									<label
										htmlFor={id}
										className="hover:bg-muted/60 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors motion-reduce:transition-none"
									>
										<Checkbox
											id={id}
											checked={!hidden.has(kind)}
											onCheckedChange={() => onToggleKind(kind)}
										/>
										<span aria-hidden className="flex">
											{def.mark({ primary: true })}
										</span>
										<span className="flex-1">{def.plural}</span>
										<span className="text-muted-foreground text-xs tabular-nums">
											{counts.get(kind) ?? 0}
										</span>
									</label>
								</li>
							);
						})}
						<li>
							<label
								htmlFor="calendar-sessions"
								className="hover:bg-muted/60 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors motion-reduce:transition-none"
							>
								<Checkbox
									id="calendar-sessions"
									checked={showSessions}
									onCheckedChange={onToggleSessions}
								/>
								<span aria-hidden className="bg-chart-2/30 size-2.5 rounded-[3px]" />
								<span className="flex-1">Sessioni d'esame</span>
							</label>
						</li>
					</ul>
				</Section>

				<Section title="Prossimi">
					{next.length === 0 ? (
						<p className="text-muted-foreground px-2 text-sm">
							Niente in arrivo. Aggiungi qualcosa con Crea.
						</p>
					) : (
						<ul className="flex flex-col">
							{next.map(entry => {
								const days = daysBetween(today, entry.date);
								const when =
									days <= 0 ? "oggi" : days === 1 ? "domani" : formatDay(entry.date);
								return (
									<li key={`${entry.id}@${entry.date}`}>
										<button
											type="button"
											onClick={() => onSelectEntry(entry)}
											className="hover:bg-muted/60 focus-visible:ring-ring flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
										>
											<span aria-hidden className="mt-1.5 flex">
												{ENTRY_KINDS[entry.kind].mark(entry)}
											</span>
											<span className="min-w-0 flex-1">
												<span className="block truncate text-sm font-medium">
													{entry.title}
												</span>
												<span className="text-muted-foreground block text-xs first-letter:uppercase">
													{[when, entry.time].filter(Boolean).join(" · ")}
												</span>
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</Section>
			</div>
		</div>
	);
}
