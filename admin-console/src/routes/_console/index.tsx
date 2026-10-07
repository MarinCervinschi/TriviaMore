import { ChecklistMinimalisticIcon } from "@solar-icons/react/linear/checklist-minimalistic";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { InsetCard } from "@/components/ui/inset-card";
import { formatAcademicYear } from "@/lib/catalog/academic-year";

import { ConsolePage } from "~/components/console-page";
import { FigureCard } from "~/components/figure-card";
import { type Status, StatusBadge } from "~/components/status-badge";
import { catalogQueries } from "~/lib/catalog/queries";
import { formatDateTime, formatNumber, formatPercent } from "~/lib/format";

export const Route = createFileRoute("/_console/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(catalogQueries.overview()),
	component: DashboardPage,
});

function DashboardPage() {
	const { data: overview } = useSuspenseQuery(catalogQueries.overview());
	const coverage =
		overview.studiable > 0 ? overview.studiableWithSyllabus / overview.studiable : null;

	const sources: {
		name: string;
		detail: string;
		to?: string;
		status: Status;
		label: string;
	}[] = [
		{
			name: "Catalogo CINECA",
			detail: `Piani aggiornati il ${formatDateTime(overview.plansUpdatedAt)}`,
			to: "/sources/catalog",
			status: overview.plansUpdatedAt ? "success" : "neutral",
			label: overview.plansUpdatedAt ? "Importato" : "Vuoto",
		},
		{
			name: "Schede insegnamento",
			detail: `Schede aggiornate il ${formatDateTime(overview.syllabiUpdatedAt)}`,
			to: "/sources/classes",
			status: overview.syllabiUpdatedAt ? "success" : "neutral",
			label: overview.syllabiUpdatedAt ? "Importato" : "Vuoto",
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

	return (
		<ConsolePage
			title="Panoramica"
			description="Lo stato dei dati nello staging: quanti sono e quando sono stati importati l'ultima volta."
		>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<FigureCard
					label="Insegnamenti"
					value={formatNumber(overview.classes)}
					hint={`${formatNumber(overview.studiable)} studiabili nell'offerta corrente`}
				/>
				<FigureCard
					label="Schede insegnamento"
					value={formatNumber(overview.syllabi)}
					hint={`${formatPercent(coverage)} degli insegnamenti studiabili`}
				/>
				<FigureCard
					label="Righe di piano"
					value={formatNumber(overview.planRows)}
					hint={
						overview.firstCohort && overview.lastCohort
							? `coorti ${formatAcademicYear(overview.firstCohort)} – ${formatAcademicYear(overview.lastCohort)}`
							: "nessun piano importato"
					}
				/>
				<FigureCard
					label="Corsi"
					value={formatNumber(overview.courses)}
					hint={`${formatNumber(overview.curricula)} curriculum in tutte le coorti`}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<InsetCard
					title="Fonti dati"
					description="Da dove vengono i dati, e quando sono arrivati."
				>
					<ul className="divide-y">
						{sources.map(source => (
							<li
								key={source.name}
								className="flex items-center justify-between gap-4 px-4 py-3"
							>
								<div className="min-w-0">
									{source.to ? (
										<Link
											to={source.to}
											className="hover:text-brand truncate text-sm font-medium transition-colors motion-reduce:transition-none"
										>
											{source.name}
										</Link>
									) : (
										<p className="truncate text-sm font-medium">{source.name}</p>
									)}
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
					<div className="flex flex-col items-center px-6 py-10 text-center">
						<ChecklistMinimalisticIcon className="text-muted-foreground mb-2 size-6" />
						<p className="text-sm font-medium">Nessuna esecuzione</p>
						<p className="text-muted-foreground mt-1 max-w-xs text-xs">
							I job si avviano dalla console quando arriva il worker. Per ora girano da
							terminale, con <code className="font-mono">pnpm catalog:sync</code>.
						</p>
					</div>
				</InsetCard>
			</div>
		</ConsolePage>
	);
}
