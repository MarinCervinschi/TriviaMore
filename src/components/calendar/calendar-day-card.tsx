import { useMemo, useState } from "react";

import { CalendarIcon } from "@solar-icons/react/linear/calendar";

import { PlusGlyph } from "@/components/icons";
import { SeeAllLink } from "@/components/shared/see-all-link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { InlineEmpty } from "@/components/ui/empty-state";
import { InsetCard } from "@/components/ui/inset-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { BUSY_DOT, busyDays, entriesOn } from "./calendar-adapter";
import { ENTRY_KINDS } from "./calendar-entry";
import {
	type CalendarEntry,
	type EntryKind,
	type EntrySpan,
	KIND_ORDER,
	formatDay,
} from "./calendar-model";

const ALL = "all";

/** Wider days from md up; the inline tokens of the primitive need `!` to give way. */
const ROOMY_DAYS =
	"md:[--rdp-day-width:2.75rem]! md:[--rdp-day-height:2.75rem]! md:[--rdp-day_button-width:2.5rem]! md:[--rdp-day_button-height:2.5rem]!";

const toIso = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fromIso = (iso: string) => {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year!, month! - 1, day);
};

function whenOf(entry: CalendarEntry) {
	if (entry.time) return entry.endTime ? `${entry.time}–${entry.endTime}` : entry.time;
	return entry.endDate ? `Fino a ${formatDay(entry.endDate)}` : "Tutto il giorno";
}

function EntryRow({
	entry,
	onOpen,
	onToggle,
}: {
	entry: CalendarEntry;
	onOpen: (entry: CalendarEntry) => void;
	onToggle: (entry: CalendarEntry) => void;
}) {
	const kind = ENTRY_KINDS[entry.kind];
	const struck = kind.checkable && entry.done;
	return (
		<li className="hover:bg-muted/50 flex items-start gap-3 px-4 py-3 transition-colors motion-reduce:transition-none">
			{kind.checkable ? (
				<button
					type="button"
					role="checkbox"
					aria-checked={Boolean(entry.done)}
					aria-label={`Segna ${entry.title} come fatta`}
					onClick={() => onToggle(entry)}
					className="focus-visible:ring-ring hover:bg-muted -m-1 rounded-full p-1 focus-visible:ring-2 focus-visible:outline-none"
				>
					{kind.mark(entry)}
				</button>
			) : (
				<span aria-hidden className="mt-1 flex">
					{kind.mark(entry)}
				</span>
			)}
			<button
				type="button"
				onClick={() => onOpen(entry)}
				className="focus-visible:ring-ring min-w-0 flex-1 rounded-sm text-left focus-visible:ring-2 focus-visible:outline-none"
			>
				<span
					className={cn(
						"block truncate text-sm font-medium",
						struck && "text-muted-foreground line-through"
					)}
				>
					{entry.title}
				</span>
				<span className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 text-xs">
					<span className="tabular-nums">{whenOf(entry)}</span>
					{entry.detail && <span className="truncate">· {entry.detail}</span>}
					{entry.kind === "sitting" && entry.primary && !entry.done && (
						<span className="text-brand font-medium">· Appello scelto</span>
					)}
				</span>
			</button>
		</li>
	);
}

/** The dashboard's calendar: a month to pick a day from, and what that day holds. */
export function CalendarDayCard({
	entries,
	today,
	onOpen,
	onToggle,
	onAdd,
}: {
	entries: CalendarEntry[];
	/** The viewer's local day, "yyyy-MM-dd". */
	today: string;
	onOpen: (entry: CalendarEntry) => void;
	onToggle: (entry: CalendarEntry) => void;
	onAdd: (span: EntrySpan) => void;
}) {
	const [day, setDay] = useState(today);
	const [month, setMonth] = useState(() => fromIso(today));
	const [kind, setKind] = useState<EntryKind | typeof ALL>(ALL);

	const shown = useMemo(
		() => (kind === ALL ? entries : entries.filter(entry => entry.kind === kind)),
		[entries, kind]
	);
	const busy = useMemo(() => busyDays(shown, month), [shown, month]);
	const onDay = useMemo(() => entriesOn(shown, day), [shown, day]);
	const kinds = Object.keys(KIND_ORDER) as EntryKind[];

	return (
		<InsetCard
			title="Calendario"
			actions={
				<SeeAllLink to="/user/calendar" icon={CalendarIcon}>
					Apri il calendario
				</SeeAllLink>
			}
			panelClassName="grid md:grid-cols-[auto_1fr]"
		>
			<div className="border-b p-4 md:border-r md:border-b-0">
				<Calendar
					mode="single"
					required
					selected={fromIso(day)}
					onSelect={date => setDay(toIso(date))}
					month={month}
					onMonthChange={setMonth}
					weekStartsOn={1}
					modifiers={{ busy }}
					modifiersClassNames={{ busy: BUSY_DOT }}
					className={cn("mx-auto p-0", ROOMY_DAYS)}
				/>
			</div>
			<div className="@container flex min-w-0 flex-col">
				<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
					<div className="min-w-0 basis-full @sm:flex-1 @sm:basis-auto">
						<p className="truncate font-semibold first-letter:uppercase">
							{formatDay(day)}
						</p>
						<p className="text-muted-foreground text-xs">
							{onDay.length === 0
								? "Niente in programma"
								: onDay.length === 1
									? "Una voce"
									: `${onDay.length} voci`}
						</p>
					</div>
					<Select value={kind} onValueChange={value => setKind(value as typeof kind)}>
						<SelectTrigger className="h-8 w-32" aria-label="Mostra">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL}>Tutto</SelectItem>
							{kinds.map(value => (
								<SelectItem key={value} value={value}>
									{ENTRY_KINDS[value].plural}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button size="sm" onClick={() => onAdd({ date: day })}>
						<PlusGlyph className="size-4" />
						Aggiungi
					</Button>
				</div>
				{onDay.length === 0 ? (
					<InlineEmpty>
						Un giorno libero. Aggiungi un evento, una task o un appello.
					</InlineEmpty>
				) : (
					<ul className="max-h-80 min-h-0 flex-1 divide-y overflow-y-auto">
						{onDay.map(entry => (
							<EntryRow
								key={`${entry.id}@${entry.date}`}
								entry={entry}
								onOpen={onOpen}
								onToggle={onToggle}
							/>
						))}
					</ul>
				)}
			</div>
		</InsetCard>
	);
}
