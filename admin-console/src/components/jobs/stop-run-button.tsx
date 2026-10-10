import { StopCircleIcon } from "@solar-icons/react/linear/stop-circle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { stopRunFn } from "~/lib/jobs/api";
import type { JobRun } from "~/lib/jobs/types";

/** Stops a run in progress; nothing half-written stays behind, because the jobs write in one transaction. */
export function StopRunButton({ run }: { run: JobRun }) {
	const queryClient = useQueryClient();
	const stop = useMutation({
		mutationFn: () => stopRunFn({ data: { id: run.id } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "runs"] });
			toast.success("Arresto richiesto: il worker la ferma tra pochi secondi.");
		},
		onError: () => toast.error("Non è stato possibile fermare l'esecuzione."),
	});

	if (run.status !== "RUNNING") return null;
	const stopping = Boolean(run.cancelRequestedAt) || stop.isPending;

	return (
		<Button
			size="sm"
			variant="outline"
			className="text-danger hover:text-danger"
			disabled={stopping}
			onClick={() => stop.mutate()}
		>
			{stopping ? <Spinner /> : <StopCircleIcon className="size-4" />}
			{stopping ? "Arresto in corso…" : "Ferma"}
		</Button>
	);
}
