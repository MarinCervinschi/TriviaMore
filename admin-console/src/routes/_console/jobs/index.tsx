import { useMemo } from "react";

import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
	DataTable,
	type DataTableFacetOption,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import { InlineEmpty } from "@/components/ui/empty-state";

import { ConsolePage } from "~/components/console-page";
import { RUN_STATUS, RunStatusBadge } from "~/components/jobs/run-status-badge";
import { WorkerBar } from "~/components/jobs/worker-status";
import { formatDateTime, formatDuration } from "~/lib/format";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobInfo, JobRun } from "~/lib/jobs/types";

export const Route = createFileRoute("/_console/jobs/")({
	validateSearch: z.object({
		...dataTableSearchFields,
		area: dataTableFilterField,
		status: dataTableFilterField,
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(jobQueries.jobs()),
			context.queryClient.ensureQueryData(jobQueries.runs()),
			context.queryClient.ensureQueryData(jobQueries.overview("week")),
		]),
	component: CataloguePage,
});

type CatalogueRow = { job: JobInfo; last: JobRun | undefined; next: string | null };

const NEVER = "NEVER";

const STATUS_OPTIONS: DataTableFacetOption[] = [
	...Object.entries(RUN_STATUS).map(([value, { label }]) => ({ value, label })),
	{ value: NEVER, label: "Mai eseguito" },
];

const column = createDataTableColumns<CatalogueRow>();

function buildColumns(areas: DataTableFacetOption[]) {
	return [
		column.accessor(row => row.job.label, {
			id: "job",
			header: "Job",
			meta: { label: "Job" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-medium">{row.original.job.label}</p>
					<p className="text-muted-foreground max-w-sm truncate text-xs">
						{row.original.job.description}
					</p>
				</div>
			),
		}),
		column.accessor(row => row.job.area, {
			id: "area",
			header: "Area",
			filterFn: "facet",
			meta: { label: "Area", facet: { options: areas, icon: LayersIcon } },
		}),
		column.accessor(row => row.last?.status ?? NEVER, {
			id: "status",
			header: "Ultima esecuzione",
			filterFn: "facet",
			meta: {
				label: "Ultima esecuzione",
				facet: { options: STATUS_OPTIONS, icon: ChecklistMinimalisticIcon },
			},
			cell: ({ row }) =>
				row.original.last ? (
					<div className="flex flex-col items-start gap-1">
						<RunStatusBadge status={row.original.last.status} />
						<span className="text-muted-foreground text-xs">
							{row.original.last.dryRun ? "Simulazione" : "Applica"} ·{" "}
							{formatDateTime(row.original.last.queuedAt)}
						</span>
					</div>
				) : (
					<span className="text-muted-foreground text-xs">Mai eseguito</span>
				),
		}),
		column.display({
			id: "duration",
			header: "Durata",
			meta: { label: "Durata", align: "right", hideBelow: "lg" },
			cell: ({ row }) => (
				<span className="tabular-nums">
					{row.original.last
						? formatDuration(row.original.last.startedAt, row.original.last.finishedAt)
						: "—"}
				</span>
			),
		}),
		column.accessor(row => row.next ?? "", {
			id: "next",
			header: "Prossima",
			meta: { label: "Prossima", align: "right", hideBelow: "md" },
			cell: ({ row }) => (
				<span className="text-muted-foreground text-xs whitespace-nowrap">
					{row.original.next ? formatDateTime(row.original.next) : "Non pianificato"}
				</span>
			),
		}),
	];
}

function CataloguePage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: jobs } = useSuspenseQuery(jobQueries.jobs());
	const { data: runs } = useSuspenseQuery(jobQueries.runs());
	const { data: overview } = useSuspenseQuery(jobQueries.overview("week"));

	const rows = useMemo<CatalogueRow[]>(() => {
		const schedules = overview.rows.map(row => row.schedule);
		return jobs.map(job => ({
			job,
			last: runs.find(run => run.job === job.name),
			next:
				schedules
					.filter(s => s.job === job.name && !s.paused && s.nextRun)
					.map(s => s.nextRun!)
					.sort()[0] ?? null,
		}));
	}, [jobs, runs, overview]);

	const columns = useMemo(
		() =>
			buildColumns(
				[...new Set(jobs.map(job => job.area))].map(area => ({
					value: area,
					label: area,
				}))
			),
		[jobs]
	);

	const table = useDataTable({
		data: rows,
		columns,
		getRowId: row => row.job.name,
		searchFn: (row, query) =>
			[row.job.label, row.job.description, row.job.name].some(text =>
				text.toLowerCase().includes(query)
			),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<ConsolePage
			title="Job"
			description="Ogni job della console. Aprine uno per avviarlo, vedere le sue esecuzioni e pianificarlo."
		>
			<WorkerBar />
			<DataTable
				table={table}
				toolbar={
					<DataTableToolbar
						table={table}
						filterVariant="inline"
						searchPlaceholder="Cerca un job…"
					/>
				}
				empty={<InlineEmpty>Nessun job trovato.</InlineEmpty>}
				onRowClick={row =>
					navigate({ to: "/jobs/$job", params: { job: row.job.name } })
				}
				rowLink={row => (
					<Link
						to="/jobs/$job"
						params={{ job: row.job.name }}
						aria-label={`Apri ${row.job.label}`}
					/>
				)}
			/>
		</ConsolePage>
	);
}
