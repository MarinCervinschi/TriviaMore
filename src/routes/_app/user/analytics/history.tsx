import { useCallback, useMemo, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";
import { StarIcon } from "@solar-icons/react/linear/star";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, startOfMonth, startOfYear, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { z } from "zod";

import {
	DataTable,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import type { CustomInlineFilter, DataTableFacetOption } from "@/components/data-table";
import { FavoriteStar } from "@/components/progress/favorite-star";
import { ScoreRing } from "@/components/progress/score-ring";
import { MetricCard } from "@/components/shared/metric-card";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { AttemptHistorySkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, InlineEmpty } from "@/components/ui/empty-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { sectionDisplayName } from "@/lib/catalog/constants";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import type { AttemptHistoryEntry } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { localDayIndex } from "@/lib/utils/datetime";
import { formatDate } from "@/lib/utils/format";
import { formatGradeOutOf33, getGradeColor } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

const MODE_LABELS: Record<string, string> = {
	STUDY: "Studio",
	EXAM_SIMULATION: "Esame",
};

const FAVORITE_OPTIONS: DataTableFacetOption[] = [
	{ value: "si", label: "Solo preferiti" },
	{ value: "no", label: "Non preferiti" },
];

const MODE_OPTIONS: DataTableFacetOption[] = [
	{ value: "STUDY", label: "Studio" },
	{ value: "EXAM_SIMULATION", label: "Esame" },
];

const INITIAL_SORTING = [{ id: "completedAt", desc: true }];
const INITIAL_COLUMN_VISIBILITY = {
	corso: false,
	dipartimento: false,
	preferiti: false,
};
const DATE_RESET_KEYS = ["da", "a"];

export const Route = createFileRoute("/_app/user/analytics/history")({
	validateSearch: z.object({
		...dataTableSearchFields,
		da: z.string().optional().catch(undefined),
		preferiti: dataTableFilterField,
		a: z.string().optional().catch(undefined),
		corso: dataTableFilterField,
		dipartimento: dataTableFilterField,
		insegnamento: dataTableFilterField,
		modalita: dataTableFilterField,
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(userQueries.attemptHistory()),
	head: () => seoHead({ title: "Cronologia tentativi", noindex: true }),
	pendingComponent: AttemptHistorySkeleton,
	component: AttemptHistoryPage,
});

const column = createDataTableColumns<AttemptHistoryEntry>();

function deriveFacetOptions(attempts: AttemptHistoryEntry[]) {
	const departments = new Map<string, string>();
	const courses = new Map<string, string>();
	const classes = new Map<string, string>();
	for (const attempt of attempts) {
		if (attempt.departmentId && attempt.departmentName) {
			departments.set(attempt.departmentId, attempt.departmentName);
		}
		if (attempt.courseId && attempt.courseName) {
			courses.set(attempt.courseId, attempt.courseName);
		}
		if (attempt.classId && attempt.className) {
			classes.set(attempt.classId, attempt.className);
		}
	}
	const byLabel = (map: Map<string, string>) =>
		[...map]
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	return {
		corso: byLabel(courses),
		dipartimento: byLabel(departments),
		insegnamento: byLabel(classes),
	};
}

function buildColumns(facets: ReturnType<typeof deriveFacetOptions>) {
	return [
		// The grade comes first: scanning a history, it is the column the eye wants.
		column.accessor("score", {
			header: "Voto",
			meta: { label: "Voto", align: "center", headerClassName: "w-20" },
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<ScoreRing score={row.original.score} />
					<span
						className={cn(
							"text-sm font-semibold tabular-nums",
							getGradeColor(row.original.score)
						)}
					>
						/33
					</span>
				</div>
			),
		}),
		column.accessor("completedAt", {
			header: "Data",
			meta: {
				label: "Data",
				cellClassName: "text-muted-foreground text-sm whitespace-nowrap",
			},
			cell: ({ row }) => formatDate(row.original.completedAt),
		}),
		column.accessor(row => row.sectionName ?? "", {
			id: "sezione",
			header: "Sezione",
			enableSorting: false,
			meta: { label: "Sezione", cellClassName: "min-w-[14rem] font-medium" },
			cell: ({ row }) => {
				if (!row.original.sectionName) {
					return (
						<span className="text-muted-foreground italic">Sezione eliminata</span>
					);
				}
				const name = sectionDisplayName(row.original.sectionName);
				return row.original.quizId ? (
					<Link
						to="/quiz/results/$attemptId"
						params={{ attemptId: row.original.id }}
						className="group-hover:text-brand transition-colors"
					>
						{name}
					</Link>
				) : (
					name
				);
			},
		}),
		column.accessor(row => row.classId ?? "", {
			id: "insegnamento",
			header: "Insegnamento",
			enableSorting: false,
			filterFn: "facet",
			meta: {
				label: "Insegnamento",
				facet: { options: facets.insegnamento, icon: BookIcon },
				cellClassName: "text-muted-foreground text-sm",
			},
			cell: ({ row }) => row.original.className ?? "—",
		}),
		// Filter-only: course and department are filters, not table columns.
		column.accessor(row => row.courseId ?? "", {
			id: "corso",
			header: "Corso",
			enableSorting: false,
			filterFn: "facet",
			meta: {
				label: "Corso",
				facet: { options: facets.corso, icon: DiplomaIcon },
			},
			cell: ({ row }) => row.original.courseName ?? "—",
		}),
		column.accessor(row => row.departmentId ?? "", {
			id: "dipartimento",
			header: "Dipartimento",
			enableSorting: false,
			filterFn: "facet",
			meta: {
				label: "Dipartimento",
				facet: { options: facets.dipartimento, icon: BuildingsIcon },
			},
			cell: ({ row }) => row.original.departmentName ?? "—",
		}),
		column.accessor("quizMode", {
			id: "modalita",
			header: "Modalità",
			enableSorting: false,
			filterFn: "facet",
			meta: {
				label: "Modalità",
				facet: { options: MODE_OPTIONS, icon: NotebookIcon },
				align: "center",
			},
			cell: ({ row }) =>
				row.original.quizMode ? (
					<Badge variant="secondary">{MODE_LABELS[row.original.quizMode]}</Badge>
				) : (
					"—"
				),
		}),
		column.accessor(row => row.timeSpent ?? 0, {
			id: "tempo",
			header: "Tempo",
			meta: {
				label: "Tempo",
				align: "right",
				hideBelow: "md",
				cellClassName: "text-muted-foreground text-sm whitespace-nowrap",
			},
			cell: ({ row }) =>
				row.original.timeSpent != null ? formatTimeSpent(row.original.timeSpent) : "—",
		}),
		// Filter-only, like course and department: the star in the row is the control,
		// this column exists so the toolbar and the URL can filter on it.
		column.accessor(row => (row.isFavorite ? "si" : "no"), {
			id: "preferiti",
			header: "Preferiti",
			enableSorting: false,
			filterFn: "facet",
			meta: {
				label: "Preferiti",
				facet: { options: FAVORITE_OPTIONS, icon: StarIcon },
				align: "center",
			},
			cell: ({ row }) => (row.original.isFavorite ? "Sì" : "—"),
		}),
		column.display({
			id: "azioni",
			header: "",
			enableHiding: false,
			meta: { label: "Azioni", align: "right" },
			cell: ({ row }) => (
				<FavoriteStar
					attemptId={row.original.id}
					isFavorite={row.original.isFavorite}
				/>
			),
		}),
	];
}

function parseDay(value: string) {
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

const isoDay = (day: Date) => format(day, "yyyy-MM-dd");

function buildDatePresets() {
	const today = new Date();
	return [
		{ label: "Oggi", da: isoDay(today), a: isoDay(today) },
		{ label: "Ieri", da: isoDay(subDays(today, 1)), a: isoDay(subDays(today, 1)) },
		{ label: "Ultimi 7 giorni", da: isoDay(subDays(today, 6)), a: isoDay(today) },
		{ label: "Ultimi 30 giorni", da: isoDay(subDays(today, 29)), a: isoDay(today) },
		{ label: "Questo mese", da: isoDay(startOfMonth(today)), a: isoDay(today) },
		{ label: "Quest'anno", da: isoDay(startOfYear(today)), a: isoDay(today) },
	];
}

// Presets sidebar + a two-month range calendar, then Annulla/Applica — the
// date range with presets after ReUI's data-grid date filter.
function DateRangePanel({
	from,
	to,
	onApply,
	onCancel,
}: {
	from?: string;
	to?: string;
	onApply: (range: { da?: string; a?: string }) => void;
	onCancel: () => void;
}) {
	const [draft, setDraft] = useState<DateRange | undefined>(() =>
		from || to
			? { from: from ? parseDay(from) : undefined, to: to ? parseDay(to) : undefined }
			: undefined
	);

	const bounds = useMemo(() => {
		const year = new Date().getFullYear();
		return { start: new Date(year - 6, 0), end: new Date(year + 1, 11) };
	}, []);

	const matches = (preset: { da: string; a: string }) =>
		!!draft?.from &&
		!!draft?.to &&
		isoDay(draft.from) === preset.da &&
		isoDay(draft.to) === preset.a;

	return (
		<div>
			<div className="flex max-sm:flex-col">
				<div className="border-border flex flex-col gap-0.5 p-2 max-sm:border-b sm:w-36 sm:border-e">
					{buildDatePresets().map(preset => (
						<Button
							key={preset.label}
							type="button"
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 w-full justify-start font-normal",
								matches(preset) && "bg-accent"
							)}
							onClick={() =>
								setDraft({ from: parseDay(preset.da), to: parseDay(preset.a) })
							}
						>
							{preset.label}
						</Button>
					))}
				</div>
				<Calendar
					mode="range"
					numberOfMonths={2}
					captionLayout="dropdown"
					startMonth={bounds.start}
					endMonth={bounds.end}
					selected={draft}
					defaultMonth={draft?.from ?? draft?.to}
					onSelect={setDraft}
				/>
			</div>
			<div className="border-border flex items-center justify-end gap-2 border-t p-2">
				<Button variant="outline" size="sm" onClick={onCancel}>
					Annulla
				</Button>
				<Button
					size="sm"
					onClick={() =>
						onApply({
							da: draft?.from ? isoDay(draft.from) : undefined,
							a: draft?.to
								? isoDay(draft.to)
								: draft?.from
									? isoDay(draft.from)
									: undefined,
						})
					}
				>
					Applica
				</Button>
			</div>
		</div>
	);
}

function AttemptHistoryPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const hydrated = useIsHydrated();

	const facets = useMemo(() => deriveFacetOptions(attempts), [attempts]);
	const columns = useMemo(() => buildColumns(facets), [facets]);

	// The range is picked on the viewer's calendar, so it must be compared there
	// too — `completedAt` is UTC, and slicing its date would push a quiz finished
	// just after midnight into the day before. Only the browser knows it, hence
	// the gate.
	const rows = useMemo(() => {
		if (!hydrated || (!search.da && !search.a)) return attempts;
		const from = search.da ? localDayIndex(parseDay(search.da)) : null;
		const to = search.a ? localDayIndex(parseDay(search.a)) : null;
		return attempts.filter(attempt => {
			const day = localDayIndex(attempt.completedAt);
			if (from !== null && day < from) return false;
			if (to !== null && day > to) return false;
			return true;
		});
	}, [attempts, search.da, search.a, hydrated]);

	const table = useDataTable({
		data: rows,
		columns,
		getRowId: row => row.id,
		pageSize: 10,
		initialSorting: INITIAL_SORTING,
		initialColumnVisibility: INITIAL_COLUMN_VISIBILITY,
		extraResetKeys: DATE_RESET_KEYS,
		searchFn: (attempt, query) =>
			(attempt.sectionName?.toLowerCase().includes(query) ?? false) ||
			(attempt.className?.toLowerCase().includes(query) ?? false) ||
			(attempt.courseName?.toLowerCase().includes(query) ?? false) ||
			(attempt.departmentName?.toLowerCase().includes(query) ?? false),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	const isFiltered =
		!!search.q ||
		!!search.preferiti ||
		!!search.da ||
		!!search.a ||
		!!search.corso ||
		!!search.dipartimento ||
		!!search.insegnamento ||
		!!search.modalita;

	const setDateRange = useCallback(
		(range: { da?: string; a?: string }) =>
			navigate({ search: prev => ({ ...prev, ...range, page: undefined }) }),
		[navigate]
	);

	const dateFilter: CustomInlineFilter = {
		id: "data",
		label: "Data",
		icon: CalendarMinimalisticIcon,
		active: !!search.da || !!search.a,
		summary: `${search.da ? formatDate(search.da) : "…"} – ${
			search.a ? formatDate(search.a) : "…"
		}`,
		placeholder: "Qualsiasi periodo",
		clear: () => setDateRange({ da: undefined, a: undefined }),
		popover: close => (
			<DateRangePanel
				from={search.da}
				to={search.a}
				onApply={range => {
					setDateRange(range);
					close();
				}}
				onCancel={close}
			/>
		),
	};

	return (
		<TooltipProvider delayDuration={200}>
			<div className="container space-y-4 py-6 pb-10">
				<PageToolbar
					breadcrumb={
						<UserBreadcrumb
							current="Storico"
							trail={[{ label: "Analytics", to: "/user/analytics" }]}
						/>
					}
					actions={
						<Button
							variant={search.preferiti ? "default" : "outline"}
							size="sm"
							onClick={() =>
								navigate({
									search: prev => ({
										...prev,
										preferiti: prev.preferiti ? undefined : "si",
										page: undefined,
									}),
								})
							}
						>
							<StarIcon className="size-3.5" />
							Solo preferiti
						</Button>
					}
				/>

				{attempts.length > 0 && <HistorySummary attempts={attempts} />}

				{attempts.length === 0 ? (
					<EmptyState
						icon={CupFirstIcon}
						title="Nessun tentativo"
						description="Completa un quiz per vederlo comparire qui."
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				) : (
					<DataTable
						table={table}
						rowLink={row =>
							row.quizId ? (
								<Link
									to="/quiz/results/$attemptId"
									params={{ attemptId: row.id }}
									aria-label={`Apri il risultato del ${formatDate(row.completedAt)}`}
								/>
							) : null
						}
						toolbar={
							<DataTableToolbar
								table={table}
								filterVariant="inline"
								inlineFilters={[dateFilter]}
								searchPlaceholder="Cerca per sezione, insegnamento..."
							/>
						}
						empty={
							<InlineEmpty>
								{isFiltered
									? "Nessun tentativo corrisponde ai filtri."
									: "Nessun tentativo."}
							</InlineEmpty>
						}
					/>
				)}
			</div>
		</TooltipProvider>
	);
}

/** What the whole history says, above the table that slices it. */
function HistorySummary({ attempts }: { attempts: AttemptHistoryEntry[] }) {
	const total = attempts.length;
	const average = attempts.reduce((sum, a) => sum + a.score, 0) / total;
	const timeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent ?? 0), 0);
	const best = attempts.reduce(
		(top, a) => (a.score > top.score ? a : top),
		attempts[0]!
	);
	const last = attempts.reduce((latest, a) =>
		a.completedAt > latest.completedAt ? a : latest
	);

	return (
		<div className="@container">
			<div className="grid gap-4 @[340px]:grid-cols-2 @[900px]:grid-cols-4">
				<MetricCard
					label="Quiz completati"
					value={total}
					icon={CupFirstIcon}
					tint="text-chart-1"
					comparison={`ultimo il ${formatDate(last.completedAt)}`}
				/>
				<MetricCard
					label="Media voto"
					value={formatGradeOutOf33(average)}
					icon={GraphUpIcon}
					tint="text-chart-3"
					comparison={`miglior voto ${formatGradeOutOf33(best.score)}`}
				/>
				<MetricCard
					label="Tempo totale"
					value={formatTimeSpent(timeSpent)}
					icon={ClockCircleIcon}
					tint="text-chart-4"
					comparison={`${formatTimeSpent(Math.round(timeSpent / total))} medi per quiz`}
				/>
				<MetricCard
					label="Sezioni toccate"
					value={new Set(attempts.map(a => a.sectionId).filter(Boolean)).size}
					icon={BookIcon}
					tint="text-chart-2"
					comparison={`in ${new Set(attempts.map(a => a.classId).filter(Boolean)).size} insegnamenti`}
				/>
			</div>
		</div>
	);
}
