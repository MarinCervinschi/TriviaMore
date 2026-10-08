import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CurriculumSelect } from "@/components/onboarding/curriculum-select";
import { StartYearSelect } from "@/components/onboarding/start-year-select";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";
import { Label } from "@/components/ui/label";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { useSetEnrollment } from "@/lib/crm/mutations";
import { crmQueries } from "@/lib/crm/queries";

export function EnrollmentCard() {
	const { data: enrollment, isPending } = useQuery(crmQueries.currentEnrollment());
	const setEnrollment = useSetEnrollment();
	const curriculumOptions =
		useQuery({
			...crmQueries.curriculumOptions(
				enrollment?.courseId ?? "",
				enrollment?.startYear ?? 0
			),
			enabled: Boolean(enrollment?.courseId && enrollment.startYear),
		}).data ?? [];

	return (
		<InsetCard texture="top" textureAlpha={0.12}>
			<div className="relative p-6 sm:p-8">
				<h2 className="mb-1 text-xl font-bold">Corso di studi</h2>
				<p className="text-muted-foreground mb-6 text-sm">
					È la base della tua carriera: medie, CFU e base di laurea partono da qui
				</p>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<IconTile size="lg" variant="soft" className="shrink-0">
						<DiplomaIcon />
					</IconTile>

					<div className="min-w-0 flex-1">
						{isPending ? (
							<p className="text-muted-foreground text-sm">Caricamento…</p>
						) : enrollment ? (
							<>
								<p className="truncate font-semibold">{enrollment.courseName}</p>
								<p className="text-muted-foreground truncate text-sm">
									{COURSE_TYPE_CONFIG[enrollment.courseType]?.label}
									{enrollment.courseCfu ? ` · ${enrollment.courseCfu} CFU` : ""} ·{" "}
									{enrollment.departmentName}
								</p>
							</>
						) : (
							<p className="text-muted-foreground text-sm">
								Non hai ancora collegato un corso di studi.
							</p>
						)}
					</div>

					<Button
						asChild
						variant={enrollment ? "outline" : "default"}
						className="shrink-0"
					>
						<Link to="/onboarding">{enrollment ? "Cambia" : "Collega un corso"}</Link>
					</Button>
				</div>

				{enrollment && (
					<div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-5">
						<div>
							<Label htmlFor="enrollment-start-year">Anno di immatricolazione</Label>
							<p className="text-muted-foreground text-sm">
								Decide il piano di studi della tua coorte
							</p>
						</div>
						<StartYearSelect
							id="enrollment-start-year"
							value={enrollment.startYear}
							onChange={startYear =>
								setEnrollment.mutate({ courseId: enrollment.courseId, startYear })
							}
							disabled={setEnrollment.isPending}
							className="w-36"
						/>
					</div>
				)}

				{enrollment && curriculumOptions.length > 0 && (
					<div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-5">
						<div>
							<Label htmlFor="enrollment-curriculum">Curriculum</Label>
							<p className="text-muted-foreground text-sm">
								Decide gli insegnamenti del tuo piano oltre al tronco comune
							</p>
						</div>
						<CurriculumSelect
							id="enrollment-curriculum"
							options={curriculumOptions}
							value={enrollment.curriculumId}
							onChange={curriculumId =>
								setEnrollment.mutate({ courseId: enrollment.courseId, curriculumId })
							}
							disabled={setEnrollment.isPending}
							className="w-56"
						/>
					</div>
				)}
			</div>
		</InsetCard>
	);
}
