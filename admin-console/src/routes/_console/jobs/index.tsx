import { useMemo, useState } from "react";

import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { TestTubeIcon } from "@solar-icons/react/linear/test-tube";
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
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";

import { ConsolePage } from "~/components/console-page";
import { RunSheet } from "~/components/jobs/run-sheet";
import { RUN_STATUS, RunStatusBadge } from "~/components/jobs/run-status-badge";
import { StartJobSheet } from "~/components/jobs/start-job-sheet";
import { WorkerBar } from "~/components/jobs/worker-status";
import { formatDateTime, formatDuration } from "~/lib/format";
import { jobQueries } from "~/lib/jobs/queries";
import type { JobRun } from "~/lib/jobs/types";

export const Route = createFileRoute("/_console/jobs/")({
	validateSearch: z.object({
		...dataTableSearchFields,
		job: dataTableFilterField,
		status: dataTableFilterField,
		mode: dataTableFilterField,
		detail: z.string().optional().catch(undefined),
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(jobQueries.jobs()),
			context.queryClient.ensureQueryData(jobQueries.runs()),
		]),
	component: RunsPage,
});

const STATUS_OPTIONS: DataTableFacetOption[] = Object.entries(RUN_STATUS).map(
	([value, { label }]) => ({ value, label })
);

const MODE_OPTIONS: DataTableFacetOption[] = [
	{ value: "dry-run", label: "Simulazione" },
	{ value: "apply", label: "Applica" },
];

const column = createDataTableColumns<JobRun>();

function buildColumns(jobOptions: DataTableFacetOption[]) {
	const labelOf = new Map(jobOptions.map(option => [option.value, option.label]));
	return [
		column.accessor("job", {
			header: "Job",
			filterFn: "facet",
			meta: {
				label: "Job",
				cellClassName: "min-w-[12rem]",
				facet: { options: jobOptions, icon: PlayIcon },
			},
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-medium">
						{labelOf.get(row.original.job) ?? row.original.job}
					</p>
					<p className="text-muted-foreground font-mono text-xs">{row.original.job}</p>
				</div>
			),
		}),
		column.accessor("status", {
			header: "Stato",
			filterFn: "facet",
			meta: {
				label: "Stato",
				facet: { options: STATUS_OPTIONS, icon: ChecklistMinimalisticIcon },
			},
			cell: ({ row }) => <RunStatusBadge status={row.original.status} />,
		}),
		column.accessor(row => (row.dryRun ? "dry-run" : "apply"), {
			id: "mode",
			header: "Modalità",
			filterFn: "facet",
			meta: {
				label: "Modalità",
				hideBelow: "md",
				facet: { options: MODE_OPTIONS, icon: TestTubeIcon },
			},
			cell: ({ row }) => (row.original.dryRun ? "Simulazione" : "Applica"),
		}),
		column.accessor("queuedAt", {
			header: "Accodata",
			meta: { label: "Accodata", align: "right", hideBelow: "sm" },
			cell: ({ row }) => (
				<span className="text-muted-foreground text-xs whitespace-nowrap">
					{formatDateTime(row.original.queuedAt)}
				</span>
			),
		}),
		column.display({
			id: "duration",
			header: "Durata",
			meta: { label: "Durata", align: "right", hideBelow: "lg" },
			cell: ({ row }) => (
				<span className="tabular-nums">
					{formatDuration(row.original.startedAt, row.original.finishedAt)}
				</span>
			),
		}),
	];
}

function RunsPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: jobs } = useSuspenseQuery(jobQueries.jobs());
	const { data: runs } = useSuspenseQuery(jobQueries.runs());
	const [starting, setStarting] = useState(false);
	const [editing, setEditing] = useState<JobRun>();

	const columns = useMemo(
		() => buildColumns(jobs.map(job => ({ value: job.name, label: job.label }))),
		[jobs]
	);

	const table = useDataTable({
		data: runs,
		columns,
		getRowId: row => row.id,
		resizableColumns: true,
		initialSorting: [{ id: "queuedAt", desc: true }],
		searchFn: (run, query) => run.job.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	const openDetail = (detail: string | undefined) =>
		navigate({ search: prev => ({ ...prev, detail }), resetScroll: false });

	return (
		<ConsolePage
			title="Esecuzioni"
			description="Ogni esecuzione dei job, dalla più recente. I job scrivono solo nello staging."
			actions={
				<Button size="sm" onClick={() => setStarting(true)}>
					<PlayIcon className="size-4" />
					Avvia un job
				</Button>
			}
		>
			<WorkerBar />

			<DataTable
				table={table}
				density="compact"
				toolbar={
					<DataTableToolbar
						table={table}
						filterVariant="inline"
						searchPlaceholder="Cerca job…"
					/>
				}
				empty={
					<InlineEmpty>
						{runs.length === 0
							? "Nessuna esecuzione. Avvia un job per vederla qui."
							: "Nessuna esecuzione trovata."}
					</InlineEmpty>
				}
				onRowClick={row => openDetail(row.id)}
				rowLink={row => (
					<Link
						from={Route.fullPath}
						to="."
						search={prev => ({ ...prev, detail: row.id })}
						resetScroll={false}
						aria-label={`Apri l'esecuzione di ${row.job}`}
					/>
				)}
			/>

			<RunSheet
				id={search.detail}
				jobs={jobs}
				onClose={() => openDetail(undefined)}
				onEdit={run => setEditing(run)}
			/>
			<StartJobSheet
				open={starting || Boolean(editing)}
				jobs={jobs}
				runs={runs}
				editing={editing}
				onClose={() => {
					setStarting(false);
					setEditing(undefined);
				}}
				onDone={runId => {
					setStarting(false);
					setEditing(undefined);
					openDetail(runId);
				}}
			/>
		</ConsolePage>
	);
}
