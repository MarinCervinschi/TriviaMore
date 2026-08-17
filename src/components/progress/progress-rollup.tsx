import { useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import { Tree, TreeItem } from "@/components/ui/tree";
import type { RollupCourse, RollupNode } from "@/lib/user/rollup";
import { cn } from "@/lib/utils";
import { formatThirtyScaleGrade, getGradeColor } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

type Level = "course" | "class" | "section";

type DetailRoute =
	| "/user/progress/course/$id"
	| "/user/progress/class/$id"
	| "/user/progress/section/$id";

const ROUTE: Record<Level, DetailRoute> = {
	course: "/user/progress/course/$id",
	class: "/user/progress/class/$id",
	section: "/user/progress/section/$id",
};

const DEPTH: Record<Level, number> = { course: 0, class: 1, section: 2 };

type Row = { node: RollupNode; level: Level; expandable: boolean; open: boolean };

function Stats({
	labels,
	grade,
	quizzes,
	time,
}: {
	labels?: boolean;
	grade?: number;
	quizzes?: number;
	time?: number;
}) {
	return (
		<span className="ml-auto flex items-center gap-4 ps-3 tabular-nums sm:gap-6">
			<span
				className={cn(
					"flex w-14 items-center justify-end gap-1",
					labels
						? "text-muted-foreground"
						: cn("font-semibold", getGradeColor(grade ?? 0))
				)}
			>
				{labels ? (
					<>
						<GraphUpIcon className="size-3.5" />
						Voto
					</>
				) : (
					formatThirtyScaleGrade(grade ?? 0)
				)}
			</span>
			<span className="text-muted-foreground flex w-14 items-center justify-end gap-1">
				{labels ? (
					<>
						<CupFirstIcon className="size-3.5" />
						Quiz
					</>
				) : (
					quizzes
				)}
			</span>
			<span className="text-muted-foreground hidden w-28 items-center justify-end gap-1 sm:flex">
				{labels ? (
					<>
						<ClockCircleIcon className="size-3.5" />
						Tempo
					</>
				) : (
					formatTimeSpent(time ?? 0)
				)}
			</span>
		</span>
	);
}

export function ProgressRollup({ courses }: { courses: RollupCourse[] }) {
	const [open, setOpen] = useState<Set<string>>(() => new Set());

	const toggle = (id: string) =>
		setOpen(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	// Flatten to the rows currently visible, respecting the expanded set.
	const rows: Row[] = [];
	for (const course of courses) {
		const courseOpen = open.has(course.id);
		rows.push({ node: course, level: "course", expandable: true, open: courseOpen });
		if (!courseOpen) continue;
		for (const klass of course.classes) {
			const classOpen = open.has(klass.id);
			rows.push({ node: klass, level: "class", expandable: true, open: classOpen });
			if (!classOpen) continue;
			for (const section of klass.sections) {
				rows.push({ node: section, level: "section", expandable: false, open: false });
			}
		}
	}

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Per corso</CardTitle>
			</CardHeader>
			<CardContent className="px-3 pb-3">
				{courses.length === 0 ? (
					<InlineEmpty>Nessun quiz ancora legato a un corso.</InlineEmpty>
				) : (
					<>
						<div className="flex items-center pe-1 pb-1 text-xs">
							<Stats labels />
						</div>
						<Tree indent={20} className="text-sm">
							{rows.map(({ node, level, expandable, open: isOpen }) => (
								<TreeItem key={node.id} level={DEPTH[level]}>
									<div className="bg-card flex items-center gap-1 rounded-md py-1.5 pe-1">
										{expandable ? (
											<button
												type="button"
												onClick={() => toggle(node.id)}
												aria-label={isOpen ? "Comprimi" : "Espandi"}
												className="hover:bg-muted/60 rounded-md p-1"
											>
												<AltArrowDownIcon
													className={cn(
														"text-muted-foreground size-4 transition-transform",
														!isOpen && "-rotate-90"
													)}
												/>
											</button>
										) : (
											<span className="w-6 shrink-0" />
										)}
										<Link
											to={ROUTE[level]}
											params={{ id: node.id }}
											className={cn(
												"truncate hover:underline",
												level === "course" ? "font-semibold" : "font-medium"
											)}
										>
											{node.name}
										</Link>
										<Stats
											grade={node.avgGrade}
											quizzes={node.quizzes}
											time={node.timeSpent}
										/>
									</div>
								</TreeItem>
							))}
						</Tree>
					</>
				)}
			</CardContent>
		</Card>
	);
}
