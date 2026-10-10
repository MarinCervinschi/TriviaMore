import { useState } from "react";

import { DisketteIcon } from "@solar-icons/react/linear/diskette";
import { RestartIcon } from "@solar-icons/react/linear/restart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { DetailSection, DetailSheet } from "~/components/detail-sheet";
import { saveJobTextsFn } from "~/lib/jobs/api";
import type { JobInfo } from "~/lib/jobs/types";

/** The job's name and description as the console shows them; empty, or the code's, goes back to the code's. */
export function JobTextsSheet({
	open,
	job,
	onClose,
}: {
	open: boolean;
	job: JobInfo;
	onClose: () => void;
}) {
	return (
		<DetailSheet
			open={open}
			onOpenChange={next => !next && onClose()}
			title="Nome e descrizione"
			description="Come la console mostra questo job. Si salvano nel database, il codice non cambia."
		>
			{open && <Form job={job} onClose={onClose} />}
		</DetailSheet>
	);
}

function Form({ job, onClose }: { job: JobInfo; onClose: () => void }) {
	const queryClient = useQueryClient();
	const [label, setLabel] = useState(job.label);
	const [description, setDescription] = useState(job.description);
	const edited =
		job.label !== job.original.label || job.description !== job.original.description;

	const save = useMutation({
		mutationFn: (texts: { label: string; description: string }) =>
			saveJobTextsFn({ data: { job: job.name, ...texts } }),
		onSuccess: result => {
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			void queryClient.invalidateQueries({ queryKey: ["jobs", "definitions"] });
			toast.success("Testi salvati.");
			onClose();
		},
		onError: () => toast.error("Non è stato possibile salvare i testi."),
	});

	return (
		<>
			<DetailSection title="Nome">
				<Label htmlFor="job-label" className="sr-only">
					Nome
				</Label>
				<Input
					id="job-label"
					value={label}
					maxLength={80}
					onChange={event => setLabel(event.target.value)}
				/>
				<p className="text-muted-foreground text-xs">
					Nel codice: {job.original.label}
				</p>
			</DetailSection>
			<DetailSection title="Descrizione">
				<Label htmlFor="job-description" className="sr-only">
					Descrizione
				</Label>
				<Textarea
					id="job-description"
					value={description}
					maxLength={400}
					rows={5}
					onChange={event => setDescription(event.target.value)}
				/>
				<p className="text-muted-foreground text-xs">
					Nel codice: {job.original.description}
				</p>
			</DetailSection>
			<div className="flex flex-wrap justify-end gap-2">
				{edited && (
					<Button
						size="sm"
						variant="ghost"
						className="mr-auto"
						disabled={save.isPending}
						onClick={() => save.mutate({ label: "", description: "" })}
					>
						<RestartIcon className="size-4" />
						Ripristina quelli del codice
					</Button>
				)}
				<Button size="sm" variant="outline" onClick={onClose}>
					Annulla
				</Button>
				<Button
					size="sm"
					disabled={save.isPending || label.trim() === ""}
					onClick={() => save.mutate({ label, description })}
				>
					{save.isPending ? <Spinner /> : <DisketteIcon className="size-4" />}
					Salva
				</Button>
			</div>
		</>
	);
}
