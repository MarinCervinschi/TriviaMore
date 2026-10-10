import { PlayIcon } from "@solar-icons/react/linear/play";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { dataTableFilterField, dataTableSearchFields } from "@/components/data-table";
import { Button } from "@/components/ui/button";

import { ConsolePage } from "~/components/console-page";
import { RunsTable } from "~/components/jobs/runs-table";
import { WorkerBar } from "~/components/jobs/worker-status";
import { jobQueries } from "~/lib/jobs/queries";

export const Route = createFileRoute("/_console/jobs/runs")({
	validateSearch: z.object({
		...dataTableSearchFields,
		job: dataTableFilterField,
		status: dataTableFilterField,
		mode: dataTableFilterField,
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(jobQueries.jobs()),
			context.queryClient.ensureQueryData(jobQueries.runs()),
		]),
	component: RunsPage,
});

function RunsPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: jobs } = useSuspenseQuery(jobQueries.jobs());
	const { data: runs } = useSuspenseQuery(jobQueries.runs());

	return (
		<ConsolePage
			title="Esecuzioni"
			description="Ogni esecuzione dei job, dalla più recente."
			actions={
				<Button asChild size="sm">
					<Link to="/jobs">
						<PlayIcon className="size-4" />
						Avvia un job
					</Link>
				</Button>
			}
		>
			<WorkerBar />
			<RunsTable
				runs={runs}
				jobs={jobs}
				peek
				urlState={{
					values: search,
					onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
				}}
			/>
		</ConsolePage>
	);
}
