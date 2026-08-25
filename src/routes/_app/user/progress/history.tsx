import { useCallback, useMemo, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";
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
import { AttemptHistorySkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, InlineEmpty } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { UserHero } from "@/components/user/user-hero";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { sectionDisplayName } from "@/lib/catalog/constants";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import type { AttemptHistoryEntry } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { localDayIndex } from "@/lib/utils/datetime";
import { formatDate } from "@/lib/utils/format";
import { formatThirtyScaleGrade, getGradeColor } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

const MODE_LABELS: Record<string, string> = {
	STUDY: "Studio",
	EXAM_SIMULATION: "Simulazione",
};

const MODE_OPTIONS: DataTableFacetOption[] = [
	{ value: "STUDY", label: "Studio" },
	{ value: "EXAM_SIMULATION", label: "Simulazione esame" },
];

const INITIAL_SORTING = [{ id: "completedAt", desc: true }];
const INITIAL_COLUMN_VISIBILITY = { corso: false, dipartimento: false };
const DATE_RESET_KEYS = ["da", "a"];

export const Route = createFileRoute("/_app/user/progress/history")({
	validateSearch: z.object({
		...dataTableSearchFields,
		da: z.string().optional().catch(undefined),
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
			meta: { label: "Sezione", cellClassName: "font-medium" },
			cell: ({ row }) =>
				row.original.sectionName ? (
					sectionDisplayName(row.original.sectionName)
				) : (
					<span className="text-muted-foreground italic">Sezione eliminata</span>
				),
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
		// Hidden filter-only columns: course and department are filters, not table
		// columns.
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
		column.accessor("score", {
			header: "Voto",
			meta: { label: "Voto", align: "center" },
			cell: ({ row }) => (
				<span className={`font-semibold ${getGradeColor(row.original.score)}`}>
					{formatThirtyScaleGrade(row.original.score)}
				</span>
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

	// The range is picked on the viewer's calendar, so it has to be compared on
	// the viewer's calendar too — `completedAt` is stored in UTC, and slicing its
	// date would push a quiz finished just after midnight into the day before.
	// Only the browser knows that calendar, hence the gate.
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
		<div className="space-y-8 pb-8">
			<UserHero
				icon={ClockCircleIcon}
				title="Cronologia tentativi"
				description="Tutti i quiz che hai completato, con voto e tempo impiegato"
			/>

			<div className="container space-y-6">
				<UserBreadcrumb
					current="Storico"
					trail={[{ label: "Progressi", to: "/user/progress" }]}
				/>

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
		</div>
	);
}
