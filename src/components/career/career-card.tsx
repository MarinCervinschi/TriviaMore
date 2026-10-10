import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { NotebookIcon } from "@solar-icons/react/linear/notebook";
import { Link } from "@tanstack/react-router";

import { SeeAllLink } from "@/components/shared/see-all-link";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { InsetCard } from "@/components/ui/inset-card";
import type { Career } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

import { formatExamDate, formatFigure, summaryOf } from "./career-model";

export type NextSitting = { examName: string; date: string; label: string | null };

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground truncate text-xs font-medium">{label}</p>
			<p
				className={cn(
					"text-xl font-bold tracking-tight tabular-nums @xs:text-2xl",
					tone
				)}
			>
				{value}
			</p>
		</div>
	);
}

/** The dashboard's career: the course it is built on, the figures that move, the next appello chosen. */
export function CareerCard({
	career,
	next,
}: {
	career: Career;
	next: NextSitting | null;
}) {
	const { course } = career;
	const summary = summaryOf(career);
	const passed = career.exams.some(exam => exam.status === "PASSED");

	return (
		<InsetCard
			texture="tr"
			textureAlpha={0.12}
			footer={
				<div className="flex justify-end">
					<SeeAllLink to="/user/career" icon={NotebookIcon}>
						Apri la carriera
					</SeeAllLink>
				</div>
			}
		>
			<div className="relative flex items-start gap-3 p-4">
				<IconTile size="default" variant="soft">
					<DiplomaIcon />
				</IconTile>
				<div className="min-w-0">
					<Link
						to="/browse/$department/$course"
						params={{
							department: course.department.code.toLowerCase(),
							course: course.code.toLowerCase(),
						}}
						className="hover:text-brand line-clamp-2 font-semibold text-pretty transition-colors"
					>
						{course.name}
					</Link>
					<p className="text-muted-foreground truncate text-xs">
						{[course.department.code, career.cohort && `coorte ${career.cohort}`]
							.filter(Boolean)
							.join(" · ")}
					</p>
				</div>
			</div>

			{passed ? (
				<div className="@container relative border-t px-4 py-4">
					<div className="grid grid-cols-3 gap-3">
						<Stat
							label="Media"
							value={formatFigure(summary.weightedAverage)}
							tone="text-brand"
						/>
						<Stat
							label="CFU"
							value={
								course.cfu
									? `${summary.earnedCfu}/${course.cfu}`
									: String(summary.earnedCfu)
							}
						/>
						<Stat
							label="Voto stimato"
							value={
								summary.projectedFinal ? String(summary.projectedFinal.rounded) : "—"
							}
						/>
					</div>
					<div className="mt-4 flex items-center gap-2 text-sm">
						<CalendarIcon className="text-muted-foreground size-4 shrink-0" />
						{next ? (
							<p className="min-w-0 truncate">
								<span className="font-medium">{next.examName}</span>
								<span className="text-muted-foreground">
									{" · "}
									{[formatExamDate(next.date), next.label].filter(Boolean).join(" · ")}
								</span>
							</p>
						) : (
							<p className="text-muted-foreground">
								Nessun appello scelto.{" "}
								<Link
									to="/user/calendar"
									className="text-brand font-medium hover:underline"
								>
									Scegline uno
								</Link>
							</p>
						)}
					</div>
				</div>
			) : (
				<div className="relative border-t">
					<InlineEmpty
						action={
							<Button asChild size="sm" variant="outline">
								<Link to="/user/career/exams">Apri il libretto</Link>
							</Button>
						}
					>
						Segna il primo esame superato: qui compaiono media, CFU e voto stimato.
					</InlineEmpty>
				</div>
			)}
		</InsetCard>
	);
}
