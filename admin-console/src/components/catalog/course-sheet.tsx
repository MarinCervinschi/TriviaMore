import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { formatAcademicYear } from "@/lib/catalog/academic-year";

import {
	DetailList,
	DetailSection,
	DetailSheet,
	DetailSkeleton,
} from "~/components/detail-sheet";
import { catalogQueries } from "~/lib/catalog/queries";
import type { CourseDetail } from "~/lib/catalog/types";
import { formatNumber, formatPercent } from "~/lib/format";

export function CourseSheet({
	id,
	onClose,
}: {
	id: string | undefined;
	onClose: () => void;
}) {
	const { data, isPending } = useQuery({
		...catalogQueries.courseDetail(id ?? ""),
		enabled: Boolean(id),
	});

	return (
		<DetailSheet
			open={Boolean(id)}
			onOpenChange={open => !open && onClose()}
			title={data?.name ?? (isPending ? "Corso" : "Corso non trovato")}
			description={
				data &&
				`${data.code} · ${COURSE_TYPE_CONFIG[data.courseType]?.label ?? data.courseType}`
			}
			footer={
				data && (
					<>
						{data.catalogueUrl && (
							<Button asChild size="sm" variant="outline">
								<a href={data.catalogueUrl} target="_blank" rel="noreferrer">
									Catalogo
									<ArrowRightUpIcon className="size-4" />
								</a>
							</Button>
						)}
						<Button asChild size="sm">
							<Link to="/sources/classes" search={{ course: data.code }}>
								I suoi insegnamenti ({formatNumber(data.classes)})
							</Link>
						</Button>
					</>
				)
			}
		>
			{isPending ? <DetailSkeleton /> : data && <CourseBody detail={data} />}
		</DetailSheet>
	);
}

function CourseBody({ detail }: { detail: CourseDetail }) {
	return (
		<>
			<DetailSection title="Corso">
				<DetailList
					rows={[
						["Dipartimento", detail.departmentName],
						["Classe", detail.degreeClass],
						["CFU", detail.cfu],
						["Sede", detail.location && CAMPUS_LOCATION_CONFIG[detail.location]?.label],
						["Lingua", detail.teachingLanguage],
						[
							"Accesso",
							detail.restrictedAccess === null
								? null
								: detail.restrictedAccess
									? "Programmato"
									: "Libero",
						],
					]}
				/>
			</DetailSection>

			<DetailSection title={`Coorti (${detail.cohorts.length})`}>
				{detail.cohorts.length > 0 ? (
					<ul className="divide-y rounded-xl border text-sm">
						{detail.cohorts.map(cohort => (
							<li
								key={cohort.cohort}
								className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-3 py-2"
							>
								<span className="font-medium tabular-nums">
									{formatAcademicYear(cohort.cohort)}
								</span>
								<span className="text-muted-foreground text-xs">
									{formatNumber(cohort.planRows)} righe · {cohort.curricula} curriculum
								</span>
								<span className="text-xs tabular-nums">
									{formatPercent(
										cohort.planRows > 0 ? cohort.linked / cohort.planRows : null
									)}{" "}
									collegate
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-muted-foreground text-sm">Nessun piano importato.</p>
				)}
			</DetailSection>
		</>
	);
}
