import { useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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

const INDENT: Record<Level, string> = {
	course: "",
	class: "pl-6",
	section: "pl-12",
};

type Row = { node: RollupNode; level: Level; expandable: boolean; open: boolean };

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
			<CardContent className="px-2 pb-2">
				{courses.length === 0 ? (
					<InlineEmpty>Nessun quiz ancora legato a un corso.</InlineEmpty>
				) : (
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead>Voce</TableHead>
								<TableHead className="w-14 text-right">Voto</TableHead>
								<TableHead className="w-16 text-right">Quiz</TableHead>
								<TableHead className="hidden w-24 text-right sm:table-cell">
									Tempo
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map(({ node, level, expandable, open: isOpen }) => (
								<TableRow
									key={node.id}
									className={cn(level === "course" && "bg-muted/20")}
								>
									<TableCell className="py-2">
										<div className={cn("flex items-center gap-1", INDENT[level])}>
											{expandable ? (
												<button
													type="button"
													onClick={() => toggle(node.id)}
													aria-label={isOpen ? "Comprimi" : "Espandi"}
													className="hover:bg-muted/60 rounded-md p-1"
												>
													<AltArrowDownIcon
														className={cn(
															"text-muted-foreground h-4 w-4 transition-transform",
															isOpen && "rotate-180"
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
										</div>
									</TableCell>
									<TableCell
										className={cn(
											"text-right font-semibold tabular-nums",
											getGradeColor(node.avgGrade)
										)}
									>
										{formatThirtyScaleGrade(node.avgGrade)}
									</TableCell>
									<TableCell className="text-muted-foreground text-right tabular-nums">
										{node.quizzes}
									</TableCell>
									<TableCell className="text-muted-foreground hidden text-right tabular-nums sm:table-cell">
										{formatTimeSpent(node.timeSpent)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
