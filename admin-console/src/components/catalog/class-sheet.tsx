import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { formatAcademicYear } from "@/lib/catalog/academic-year";

import {
	DetailList,
	DetailSection,
	DetailSheet,
	DetailSkeleton,
} from "~/components/detail-sheet";
import { StatusBadge } from "~/components/status-badge";
import { catalogQueries } from "~/lib/catalog/queries";
import type { ClassDetail } from "~/lib/catalog/types";
import { formatNumber } from "~/lib/format";

const SYLLABUS_FIELD_COUNT = 7;

export function ClassSheet({
	id,
	onClose,
}: {
	id: string | undefined;
	onClose: () => void;
}) {
	const { data, isPending } = useQuery({
		...catalogQueries.classDetail(id ?? ""),
		enabled: Boolean(id),
	});

	return (
		<DetailSheet
			open={Boolean(id)}
			onOpenChange={open => !open && onClose()}
			title={data?.name ?? (isPending ? "Insegnamento" : "Insegnamento non trovato")}
			description={data ? describe(data) : undefined}
			footer={
				data?.syllabus?.catalogueUrl && (
					<Button asChild size="sm" variant="outline">
						<a href={data.syllabus.catalogueUrl} target="_blank" rel="noreferrer">
							Scheda sul catalogo
							<ArrowRightUpIcon className="size-4" />
						</a>
					</Button>
				)
			}
		>
			{isPending ? <DetailSkeleton /> : data && <ClassBody detail={data} />}
		</DetailSheet>
	);
}

function describe(detail: ClassDetail) {
	return (
		[detail.cfu && `${detail.cfu} CFU`, detail.ssd].filter(Boolean).join(" · ") ||
		undefined
	);
}

function ClassBody({ detail }: { detail: ClassDetail }) {
	return (
		<>
			<DetailSection title="Scheda insegnamento">
				{detail.syllabus ? (
					<DetailList
						rows={[
							["Anno", formatAcademicYear(detail.syllabus.academicYear)],
							[
								"Voci compilate",
								`${detail.syllabus.filled.length} di ${SYLLABUS_FIELD_COUNT}`,
							],
						]}
					/>
				) : (
					<p className="text-muted-foreground text-sm">
						Nessuna scheda pubblicata in nessun anno.
					</p>
				)}
			</DetailSection>

			<DetailSection title="Su TriviaMore">
				<DetailList
					rows={[
						["Sezioni", formatNumber(detail.sections)],
						["Domande", formatNumber(detail.questions)],
					]}
				/>
			</DetailSection>

			<DetailSection title={`Corsi (${detail.listings.length})`}>
				<ul className="divide-y rounded-xl border text-sm">
					{detail.listings.map(listing => (
						<li key={listing.courseId} className="space-y-1 px-3 py-2.5">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="truncate font-medium">{listing.courseName}</p>
									<p className="text-muted-foreground font-mono text-xs">
										{listing.courseCode} · {listing.department} · {listing.code}
									</p>
								</div>
								<StatusBadge status={listing.studiable ? "success" : "neutral"}>
									{listing.studiable ? "Studiabile" : "Non studiabile"}
								</StatusBadge>
							</div>
							<p className="text-muted-foreground text-xs">
								{[
									`${listing.classYear}° anno`,
									listing.mandatory ? "obbligatorio" : "a scelta",
									listing.teachingPeriod,
									listing.taf,
								]
									.filter(Boolean)
									.join(" · ")}
							</p>
						</li>
					))}
				</ul>
			</DetailSection>
		</>
	);
}
