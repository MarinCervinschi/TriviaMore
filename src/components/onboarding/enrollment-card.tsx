import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { crmQueries } from "@/lib/crm/queries";

/** The settings view of the enrolment: what is declared, and the way back in. */
export function EnrollmentCard() {
	const { data: enrollment, isPending } = useQuery(crmQueries.currentEnrollment());

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
			</div>
		</InsetCard>
	);
}
