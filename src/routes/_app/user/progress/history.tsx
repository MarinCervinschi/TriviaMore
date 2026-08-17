import { useMemo } from "react";

import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
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
import type { DataTableFacetOption } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, InlineEmpty } from "@/components/ui/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { UserHero } from "@/components/user/user-hero";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import type { AttemptHistoryEntry } from "@/lib/user/types";
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
const INITIAL_COLUMN_VISIBILITY = { dipartimento: false };
const DATE_RESET_KEYS = ["da", "a"];

export const Route = createFileRoute("/_app/user/progress/history")({
	validateSearch: z.object({
		...dataTableSearchFields,
		da: z.string().optional().catch(undefined),
		a: z.string().optional().catch(undefined),
		dipartimento: dataTableFilterField,
		insegnamento: dataTableFilterField,
		modalita: dataTableFilterField,
	}),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(userQueries.attemptHistory()),
	head: () => seoHead({ title: "Cronologia tentativi", noindex: true }),
	component: AttemptHistoryPage,
});

const column = createDataTableColumns<AttemptHistoryEntry>();

function deriveFacetOptions(attempts: AttemptHistoryEntry[]) {
	const departments = new Map<string, string>();
	const courses = new Map<string, string>();
	for (const attempt of attempts) {
		if (attempt.departmentId && attempt.departmentName) {
			departments.set(attempt.departmentId, attempt.departmentName);
		}
		if (attempt.courseId && attempt.courseName) {
			courses.set(attempt.courseId, attempt.courseName);
		}
	}
	const byLabel = (map: Map<string, string>) =>
		[...map]
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	return {
		dipartimento: byLabel(departments),
		insegnamento: byLabel(courses),
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
				row.original.sectionName ?? (
					<span className="text-muted-foreground italic">Sezione eliminata</span>
				),
		}),
		column.accessor(row => row.courseId ?? "", {
			id: "insegnamento",
			header: "Insegnamento",
			enableSorting: false,
			filterFn: "arrHas",
			meta: {
				label: "Insegnamento",
				facet: { options: facets.insegnamento },
				cellClassName: "text-muted-foreground text-sm",
			},
			cell: ({ row }) => row.original.courseName ?? "—",
		}),
		// Hidden filter-only column: department is a filter, not a table column.
		column.accessor(row => row.departmentId ?? "", {
			id: "dipartimento",
			header: "Dipartimento",
			enableSorting: false,
			filterFn: "arrHas",
			meta: { label: "Dipartimento", facet: { options: facets.dipartimento } },
			cell: ({ row }) => row.original.departmentName ?? "—",
		}),
		column.accessor("quizMode", {
			id: "modalita",
			header: "Modalità",
			enableSorting: false,
			filterFn: "arrHas",
			meta: { label: "Modalità", facet: { options: MODE_OPTIONS }, align: "center" },
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

function DateRangeFilter({
	from,
	to,
	onChange,
}: {
	from?: string;
	to?: string;
	onChange: (range: { da?: string; a?: string }) => void;
}) {
	const active = !!from || !!to;
	const selected: DateRange | undefined = active
		? { from: from ? parseDay(from) : undefined, to: to ? parseDay(to) : undefined }
		: undefined;

	const bounds = useMemo(() => {
		const year = new Date().getFullYear();
		return { start: new Date(year - 6, 0), end: new Date(year + 1, 11) };
	}, []);
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 border-dashed">
					<CalendarMinimalisticIcon className="h-4 w-4" />
					Data
					{active && (
						<>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<span className="text-xs font-normal">
								{from ? formatDate(from) : "…"} – {to ? formatDate(to) : "…"}
							</span>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto p-0">
				<Calendar
					mode="range"
					captionLayout="dropdown"
					startMonth={bounds.start}
					endMonth={bounds.end}
					selected={selected}
					defaultMonth={selected?.from ?? selected?.to}
					onSelect={range =>
						onChange({
							da: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
							a: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
						})
					}
				/>
				{active && (
					<div className="border-border/50 border-t p-2">
						<Button
							variant="ghost"
							size="sm"
							className="w-full"
							onClick={() => onChange({ da: undefined, a: undefined })}
						>
							Azzera
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}

function AttemptHistoryPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());

	const facets = useMemo(() => deriveFacetOptions(attempts), [attempts]);
	const columns = useMemo(() => buildColumns(facets), [facets]);

	const rows = useMemo(() => {
		if (!search.da && !search.a) return attempts;
		return attempts.filter(attempt => {
			const day = attempt.completedAt.slice(0, 10);
			if (search.da && day < search.da) return false;
			if (search.a && day > search.a) return false;
			return true;
		});
	}, [attempts, search.da, search.a]);

	const table = useDataTable({
		data: rows,
		columns,
		getRowId: row => row.id,
		pageSize: 50,
		initialSorting: INITIAL_SORTING,
		initialColumnVisibility: INITIAL_COLUMN_VISIBILITY,
		extraResetKeys: DATE_RESET_KEYS,
		searchFn: (attempt, query) =>
			(attempt.sectionName?.toLowerCase().includes(query) ?? false) ||
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
		!!search.dipartimento ||
		!!search.insegnamento ||
		!!search.modalita;

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={ClockCircleIcon}
				title="Cronologia tentativi"
				description="Tutti i quiz che hai completato, con voto e tempo impiegato"
			/>

			<div className="container space-y-6">
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
						rowLink={row => (
							<Link
								to="/quiz/results/$attemptId"
								params={{ attemptId: row.id }}
								aria-label={`Apri il risultato del ${formatDate(row.completedAt)}`}
							/>
						)}
						toolbar={
							<DataTableToolbar
								table={table}
								searchPlaceholder="Cerca per sezione, insegnamento..."
								filtered={!!search.da || !!search.a}
								filters={
									<DateRangeFilter
										from={search.da}
										to={search.a}
										onChange={range =>
											navigate({
												search: prev => ({ ...prev, ...range, page: undefined }),
											})
										}
									/>
								}
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
