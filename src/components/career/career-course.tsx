import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { PenIcon } from "@solar-icons/react/linear/pen";
import { SquareArrowRightUpIcon } from "@solar-icons/react/linear/square-arrow-right-up";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import type { Career } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

const LANGUAGES: Record<string, string> = { ita: "In italiano", eng: "In inglese" };

function Fact({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-0">
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="truncate text-sm font-medium">{value}</dd>
		</div>
	);
}

/** The enrolment the record is built on: course, department, cohort and curriculum. */
export function CareerCourse({ career }: { career: Career }) {
	const { course } = career;
	const type = COURSE_TYPE_CONFIG[course.courseType];
	const facts = [
		{ label: "Coorte", value: career.cohort ? String(career.cohort) : "—" },
		{ label: "Curriculum", value: career.curriculumName ?? "—" },
		{ label: "CFU", value: course.cfu ? String(course.cfu) : "—" },
		{
			label: "Sede",
			value: course.location
				? (CAMPUS_LOCATION_CONFIG[course.location]?.label ?? "—")
				: "—",
		},
	];

	return (
		<InsetCard texture="tr" textureAlpha={0.12}>
			<div className="relative flex flex-col gap-5 p-5">
				<div className="flex flex-wrap items-start gap-x-4 gap-y-3">
					<IconTile size="lg" variant="soft" className="hidden shrink-0 sm:inline-flex">
						<DiplomaIcon />
					</IconTile>
					<div className="min-w-0 flex-1 basis-64">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="text-lg font-semibold text-pretty">{course.name}</h2>
							{type && (
								<span
									className={cn(
										"text-2xs rounded-md border px-1.5 py-0.5 font-medium",
										type.className
									)}
								>
									{type.label}
								</span>
							)}
						</div>
						<p className="text-muted-foreground mt-0.5 text-sm text-pretty">
							{[
								course.department.name,
								course.degreeClass && `classe ${course.degreeClass}`,
								course.teachingLanguage && LANGUAGES[course.teachingLanguage],
							]
								.filter(Boolean)
								.join(" · ")}
						</p>
					</div>
					<div className="flex shrink-0 flex-wrap gap-2">
						{course.catalogueUrl && (
							<Button asChild variant="outline" size="sm">
								<a href={course.catalogueUrl} target="_blank" rel="noopener noreferrer">
									<SquareArrowRightUpIcon className="size-4" />
									Scheda del corso
								</a>
							</Button>
						)}
						<Button asChild variant="ghost" size="sm">
							<Link to="/onboarding">
								<PenIcon className="size-4" />
								Cambia
							</Link>
						</Button>
					</div>
				</div>
				<dl className="border-border/60 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
					{facts.map(fact => (
						<Fact key={fact.label} {...fact} />
					))}
				</dl>
			</div>
		</InsetCard>
	);
}
