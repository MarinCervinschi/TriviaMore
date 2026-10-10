import { useMemo, useState } from "react";

import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { TestTubeIcon } from "@solar-icons/react/linear/test-tube";
import { Link } from "@tanstack/react-router";

import {
	DataTable,
	type DataTableFacetOption,
	type DataTableSearch,
	DataTableToolbar,
	type DataTableUrlState,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { InlineEmpty } from "@/components/ui/empty-state";

import { formatDateTime, formatDuration } from "~/lib/format";
import type { JobInfo, JobRun } from "~/lib/jobs/types";

import { RunPeek } from "./run-peek";
import { RUN_STATUS, RunStatusBadge } from "./run-status-badge";

const STATUS_OPTIONS: DataTableFacetOption[] = Object.entries(RUN_STATUS).map(
	([value, { label }]) => ({ value, label })
);

const MODE_OPTIONS: DataTableFacetOption[] = [
	{ value: "dry-run", label: "Simulazione" },
	{ value: "apply", label: "Applica" },
];

const column = createDataTableColumns<JobRun>();

function buildColumns(jobOptions: DataTableFacetOption[], showJob: boolean) {
	const labelOf = new Map(jobOptions.map(option => [option.value, option.label]));
	return [
		...(showJob
			? [
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
								<p className="text-muted-foreground font-mono text-xs">
									{row.original.job}
								</p>
							</div>
						),
					}),
				]
			: []),
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

export type RunsSearch = DataTableSearch & {
	job?: string;
	status?: string;
	mode?: string;
};

/** Runs, newest first: a click opens a summary, the arrow the run's page; `showJob` adds the job column. */
export function RunsTable({
	runs,
	jobs,
	showJob = true,
	urlState,
}: {
	runs: JobRun[];
	jobs: JobInfo[];
	showJob?: boolean;
	urlState?: DataTableUrlState<RunsSearch>;
}) {
	const [peek, setPeek] = useState<string>();
	const columns = useMemo(
		() =>
			buildColumns(
				jobs.map(job => ({ value: job.name, label: job.label })),
				showJob
			),
		[jobs, showJob]
	);

	const table = useDataTable({
		data: runs,
		columns,
		getRowId: row => row.id,
		initialSorting: [{ id: "queuedAt", desc: true }],
		searchFn: (run, query) => run.job.toLowerCase().includes(query),
		urlState,
	});

	return (
		<>
			<DataTable
				table={table}
				density="compact"
				toolbar={
					<DataTableToolbar
						table={table}
						filterVariant="inline"
						searchPlaceholder={showJob ? "Cerca job…" : undefined}
					/>
				}
				empty={
					<InlineEmpty>
						{runs.length === 0
							? "Nessuna esecuzione. Avvia un job per vederla qui."
							: "Nessuna esecuzione trovata."}
					</InlineEmpty>
				}
				onRowClick={row => setPeek(row.id)}
				rowLink={row => (
					<Link
						to="/jobs/$job/runs/$runId"
						params={{ job: row.job, runId: row.id }}
						aria-label={`Apri l'esecuzione di ${row.job}`}
					/>
				)}
			/>
			<RunPeek id={peek} jobs={jobs} onClose={() => setPeek(undefined)} />
		</>
	);
}
