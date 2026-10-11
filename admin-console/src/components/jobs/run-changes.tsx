import { useMemo, useState } from "react";

import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";

import { AchievementMedal } from "@/components/achievements/achievement-medal";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { InsetCard } from "@/components/ui/inset-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { JobChangeRow, JobChangeValue, JobChanges } from "@/db/schema";
import { cn } from "@/lib/utils";

import { type Status, StatusBadge } from "~/components/status-badge";
import { formatNumber } from "~/lib/format";

const KINDS: Record<
	JobChangeRow["kind"],
	{ label: string; plural: string; status: Status }
> = {
	added: { label: "Aggiunta", plural: "Aggiunte", status: "success" },
	updated: { label: "Modifica", plural: "Modifiche", status: "info" },
	removed: { label: "Rimozione", plural: "Rimozioni", status: "danger" },
};

type KindFilter = JobChangeRow["kind"] | "all";

const PAGE = 50;

const shown = (value: JobChangeValue) =>
	value === null
		? "—"
		: typeof value === "boolean"
			? value
				? "sì"
				: "no"
			: String(value);

function Value({ value, struck }: { value: JobChangeValue; struck?: boolean }) {
	const [open, setOpen] = useState(false);
	const text = shown(value);
	const long = text.length > 160;
	return (
		<span className="min-w-0">
			<span
				className={cn(
					"break-words whitespace-pre-wrap",
					value === null && "text-muted-foreground",
					struck && "text-muted-foreground line-through",
					long && !open && "line-clamp-3"
				)}
			>
				{text}
			</span>
			{long && (
				<button
					type="button"
					onClick={() => setOpen(prev => !prev)}
					className="text-brand mt-0.5 block text-xs font-medium hover:underline"
				>
					{open ? "Mostra meno" : "Mostra tutto"}
				</button>
			)}
		</span>
	);
}

function ChangeRow({ row }: { row: JobChangeRow }) {
	return (
		<li className="flex items-start gap-3 px-4 py-3">
			{row.badge && (
				<AchievementMedal
					icon={row.badge.icon}
					accent={row.badge.accent}
					shape={row.badge.shape}
					tier={row.badge.tier}
					size="sm"
				/>
			)}
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<StatusBadge status={KINDS[row.kind].status}>
						{KINDS[row.kind].label}
					</StatusBadge>
					<span className="font-medium">{row.label}</span>
					{row.detail && (
						<span className="text-muted-foreground text-xs">{row.detail}</span>
					)}
				</div>
				{row.fields && row.fields.length > 0 && (
					<dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1.5 text-sm">
						{row.fields.map(field => (
							<div key={field.name} className="contents">
								<dt className="text-muted-foreground">{field.name}</dt>
								<dd className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:gap-2">
									{row.kind === "updated" ? (
										<>
											<Value value={field.before} struck />
											<span aria-hidden className="text-muted-foreground shrink-0">
												→
											</span>
											<span className="sr-only">diventa</span>
											<Value value={field.after} />
										</>
									) : (
										<Value
											value={row.kind === "removed" ? field.before : field.after}
										/>
									)}
								</dd>
							</div>
						))}
					</dl>
				)}
			</div>
		</li>
	);
}

/** The counts of a section by kind, removals stressed: they are the change to read twice. */
export function KindCounts({ counts }: { counts: JobChanges[number]["counts"] }) {
	return (
		<span className="flex gap-1.5 text-xs tabular-nums">
			{counts.added > 0 && (
				<span className="text-success">+{formatNumber(counts.added)}</span>
			)}
			{counts.updated > 0 && (
				<span className="text-info">~{formatNumber(counts.updated)}</span>
			)}
			{counts.removed > 0 && (
				<span className="text-danger font-semibold">
					−{formatNumber(counts.removed)}
				</span>
			)}
		</span>
	);
}

const matches = (row: JobChangeRow, query: string) =>
	[
		row.label,
		row.detail,
		...(row.fields ?? []).flatMap(f => [f.name, f.before, f.after]),
	]
		.filter(value => value !== null && value !== undefined)
		.some(value => String(value).toLowerCase().includes(query));

/** A run's changes: one tab per section, each row with its fields before and after. */
export function RunChanges({
	changes,
	dryRun,
}: {
	changes: JobChanges;
	dryRun: boolean;
}) {
	const [key, setKey] = useState(changes[0]?.key);
	const [kind, setKind] = useState<KindFilter>("all");
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(0);
	const current = changes.find(entry => entry.key === key) ?? changes[0];

	const rows = useMemo(() => {
		if (!current) return [];
		const q = query.trim().toLowerCase();
		return current.rows.filter(
			row => (kind === "all" || row.kind === kind) && (!q || matches(row, q))
		);
	}, [current, kind, query]);

	if (!current) {
		return (
			<InsetCard title={dryRun ? "Cosa cambierebbe" : "Cosa è cambiato"}>
				<InlineEmpty>
					{dryRun
						? "Niente da cambiare: i dati sono già allineati."
						: "Non è cambiato niente."}
				</InlineEmpty>
			</InsetCard>
		);
	}

	const total = (entry: JobChanges[number]) =>
		entry.counts.added + entry.counts.updated + entry.counts.removed;
	const kinds = (Object.keys(KINDS) as JobChangeRow["kind"][]).filter(
		value => current.counts[value] > 0
	);

	return (
		<InsetCard
			title={dryRun ? "Cosa cambierebbe" : "Cosa è cambiato"}
			description={`${formatNumber(changes.reduce((sum, entry) => sum + total(entry), 0))} righe in ${changes.length === 1 ? "una sezione" : `${changes.length} sezioni`}`}
		>
			<div
				role="tablist"
				aria-label="Sezioni"
				className="flex gap-1 overflow-x-auto border-b px-2 py-2"
			>
				{changes.map(entry => (
					<button
						key={entry.key}
						type="button"
						role="tab"
						aria-selected={entry.key === current.key}
						onClick={() => {
							setKey(entry.key);
							setKind("all");
							setPage(0);
						}}
						className={cn(
							"focus-visible:ring-ring flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
							entry.key === current.key
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						{entry.title}
						<KindCounts counts={entry.counts} />
					</button>
				))}
			</div>

			<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
				{kinds.length > 1 && (
					<SegmentedControl
						label="Tipo di modifica"
						size="sm"
						value={kind}
						onChange={value => {
							setKind(value);
							setPage(0);
						}}
						options={[
							{ value: "all", label: "Tutte", count: total(current) },
							...kinds.map(value => ({
								value,
								label: KINDS[value].plural,
								count: current.counts[value],
							})),
						]}
					/>
				)}
				<div className="relative ms-auto w-full sm:w-64">
					<MagnifierIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
					<Input
						value={query}
						onChange={event => {
							setQuery(event.target.value);
							setPage(0);
						}}
						placeholder="Cerca in questa sezione…"
						aria-label="Cerca in questa sezione"
						className="h-8 pl-8"
					/>
				</div>
			</div>

			{rows.length === 0 ? (
				<InlineEmpty>Nessuna riga corrisponde.</InlineEmpty>
			) : (
				<ul className="divide-y">
					{rows.slice(page * PAGE, (page + 1) * PAGE).map((row, index) => (
						<ChangeRow key={`${page}-${index}`} row={row} />
					))}
				</ul>
			)}

			{(rows.length > PAGE || current.omitted > 0) && (
				<div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs">
					<span>
						{rows.length > PAGE &&
							`${formatNumber(page * PAGE + 1)}–${formatNumber(Math.min((page + 1) * PAGE, rows.length))} di ${formatNumber(rows.length)}`}
						{current.omitted > 0 &&
							` · il report tiene le prime ${formatNumber(current.rows.length)} righe, altre ${formatNumber(current.omitted)} non sono salvate`}
					</span>
					{rows.length > PAGE && (
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="outline"
								disabled={page === 0}
								onClick={() => setPage(prev => prev - 1)}
							>
								Precedenti
							</Button>
							<span className="tabular-nums">
								Pagina {page + 1} di {Math.ceil(rows.length / PAGE)}
							</span>
							<Button
								size="sm"
								variant="outline"
								disabled={(page + 1) * PAGE >= rows.length}
								onClick={() => setPage(prev => prev + 1)}
							>
								Successive
							</Button>
						</div>
					)}
				</div>
			)}
		</InsetCard>
	);
}
