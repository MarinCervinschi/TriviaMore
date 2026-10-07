import { PlayCircleIcon } from "@solar-icons/react/linear/play-circle";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { InsetCard } from "@/components/ui/inset-card";

import { ConsolePage } from "~/components/console-page";
import { type Status, StatusBadge } from "~/components/status-badge";

export const Route = createFileRoute("/")({
	component: DashboardPage,
});

// Sample figures until the dashboard reads the databases (#197).
const FIGURES = [
	{ label: "Insegnamenti", value: "2.578", hint: "nel catalogo" },
	{ label: "Programmi ufficiali", value: "2.176", hint: "84% degli insegnamenti" },
	{ label: "Righe di piano", value: "28.087", hint: "coorti 2021–2026" },
	{ label: "Job oggi", value: "0", hint: "nessuna esecuzione" },
];

const SOURCES: { name: string; detail: string; status: Status; label: string }[] = [
	{
		name: "Catalogo CINECA",
		detail: "Corsi, piani e curriculum",
		status: "success",
		label: "Allineato",
	},
	{
		name: "Programmi",
		detail: "Syllabus degli insegnamenti",
		status: "success",
		label: "Allineato",
	},
	{
		name: "Orari",
		detail: "EasyAcademy e pagine di ingegneria",
		status: "neutral",
		label: "Da integrare",
	},
	{
		name: "Appelli",
		detail: "Bacheca di Esse3",
		status: "neutral",
		label: "Da integrare",
	},
];

const RUNS: { job: string; when: string; status: Status; label: string }[] = [
	{ job: "catalog:sync", when: "Esempio", status: "success", label: "Completato" },
	{ job: "catalog:syllabi", when: "Esempio", status: "success", label: "Completato" },
	{ job: "catalog:diff", when: "Esempio", status: "warning", label: "Differenze" },
];

function DashboardPage() {
	return (
		<ConsolePage
			title="Panoramica"
			description="Lo stato delle fonti dati e dei job. I numeri sono di esempio, finché la dashboard non legge i database."
			actions={
				<Button size="sm" disabled>
					<PlayCircleIcon className="size-4" />
					Avvia un job
				</Button>
			}
		>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{FIGURES.map(figure => (
					<InsetCard key={figure.label} title={figure.label}>
						<div className="p-4">
							<p className="text-2xl font-bold tabular-nums">{figure.value}</p>
							<p className="text-muted-foreground mt-0.5 text-xs">{figure.hint}</p>
						</div>
					</InsetCard>
				))}
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<InsetCard
					title="Fonti dati"
					description="Quando ogni fonte è stata letta l'ultima volta."
				>
					<ul className="divide-y">
						{SOURCES.map(source => (
							<li
								key={source.name}
								className="flex items-center justify-between gap-4 px-4 py-3"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{source.name}</p>
									<p className="text-muted-foreground truncate text-xs">
										{source.detail}
									</p>
								</div>
								<StatusBadge status={source.status}>{source.label}</StatusBadge>
							</li>
						))}
					</ul>
				</InsetCard>

				<InsetCard
					title="Ultime esecuzioni"
					description="I job lanciati dalla console, dal più recente."
				>
					<ul className="divide-y">
						{RUNS.map(run => (
							<li
								key={run.job}
								className="flex items-center justify-between gap-4 px-4 py-3"
							>
								<div className="min-w-0">
									<p className="truncate font-mono text-sm">{run.job}</p>
									<p className="text-muted-foreground text-xs">{run.when}</p>
								</div>
								<StatusBadge status={run.status}>{run.label}</StatusBadge>
							</li>
						))}
					</ul>
				</InsetCard>
			</div>
		</ConsolePage>
	);
}
