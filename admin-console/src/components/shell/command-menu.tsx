import { useEffect, useState } from "react";

import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { PlayIcon } from "@solar-icons/react/linear/play";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

import { jobQueries } from "~/lib/jobs/queries";
import { NAV } from "~/lib/nav";

/** Every page of the console, and every job's own page, reachable from ⌘K. */
export function CommandMenu() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const { data: jobs = [] } = useQuery({ ...jobQueries.jobs(), enabled: open });

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen(current => !current);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="bg-background text-muted-foreground hover:text-foreground focus-visible:ring-ring flex h-8 w-full max-w-sm items-center gap-2 rounded-lg border px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
			>
				<MagnifierIcon className="size-4 shrink-0" />
				<span className="flex-1 text-left">Cerca una pagina…</span>
				<kbd className="bg-muted text-2xs rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
			</button>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Cerca una pagina o un job…" />
				<CommandList>
					<CommandEmpty>Nessuna pagina trovata.</CommandEmpty>
					{NAV.map(section => (
						<CommandGroup key={section.id} heading={section.label}>
							{section.groups.flatMap(group =>
								group.items.map(item => (
									<CommandItem
										key={item.to}
										value={`${section.label} ${item.label}`}
										onSelect={() => {
											setOpen(false);
											void navigate({ to: item.to });
										}}
									>
										<item.icon className="size-4" />
										{item.label}
									</CommandItem>
								))
							)}
						</CommandGroup>
					))}
					{jobs.length > 0 && (
						<CommandGroup heading="Avvia un job">
							{jobs.map(job => (
								<CommandItem
									key={job.name}
									value={`avvia job ${job.area} ${job.label} ${job.name}`}
									onSelect={() => {
										setOpen(false);
										void navigate({ to: "/jobs/$job", params: { job: job.name } });
									}}
								>
									<PlayIcon className="size-4" />
									<span className="flex-1">{job.label}</span>
									<span className="text-muted-foreground text-xs">{job.area}</span>
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</CommandDialog>
		</>
	);
}
