import { useMemo, useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { ArrowDownIcon } from "@solar-icons/react/linear/arrow-down";
import { ArrowUpIcon } from "@solar-icons/react/linear/arrow-up";
import { BookIcon } from "@solar-icons/react/linear/book";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { SortVerticalIcon } from "@solar-icons/react/linear/sort-vertical";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { InlineEmpty } from "@/components/ui/empty-state";
import { Tree, TreeItem } from "@/components/ui/tree";
import { EXAM_SIMULATION_SECTION, sectionDisplayName } from "@/lib/catalog/constants";
import type { RollupCourse, RollupNode } from "@/lib/user/rollup";
import { cn } from "@/lib/utils";
import { formatGradeOutOf33, getGradeColor } from "@/lib/utils/grading";
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

const BAND: Record<Level, string> = {
	course: "bg-muted font-semibold",
	class: "bg-muted/50 font-medium",
	section: "hover:bg-muted/40 transition-colors",
};

const ENTITY_ICON: Record<Level, Icon> = {
	course: DiplomaIcon,
	class: BookIcon,
	section: DocumentTextIcon,
};

type SortKey = "name" | "grade" | "quizzes" | "time";
type SortDir = "asc" | "desc";
type Sort = { key: SortKey; dir: SortDir };

function metricOf(node: RollupNode, key: Exclude<SortKey, "name">): number {
	if (key === "grade") return node.avgGrade;
	if (key === "quizzes") return node.quizzes;
	return node.timeSpent;
}

function sortNodes<T extends RollupNode>(nodes: T[], { key, dir }: Sort): T[] {
	const factor = dir === "asc" ? 1 : -1;
	return [...nodes].sort((a, b) =>
		key === "name"
			? a.name.localeCompare(b.name) * factor
			: (metricOf(a, key) - metricOf(b, key)) * factor
	);
}

type Row = {
	node: RollupNode;
	level: Level;
	expandable: boolean;
	open: boolean;
	guides: boolean[];
};

function LevelIcon({ level }: { level: Level }) {
	const Icon = ENTITY_ICON[level];
	return <Icon className="text-muted-foreground size-4 shrink-0" />;
}

function SortHeader({
	label,
	icon: LeadIcon,
	sortKey,
	sort,
	onSort,
	className,
}: {
	label: string;
	icon?: Icon;
	sortKey: SortKey;
	sort: Sort;
	onSort: (key: SortKey) => void;
	className?: string;
}) {
	const dir = sort.key === sortKey ? sort.dir : null;
	return (
		<button
			type="button"
			onClick={() => onSort(sortKey)}
			className={cn(
				"hover:text-foreground flex items-center gap-1 transition-colors",
				dir ? "text-foreground" : "text-muted-foreground",
				className
			)}
		>
			{LeadIcon && <LeadIcon className="size-3.5" />}
			{label}
			{dir === "asc" ? (
				<ArrowUpIcon className="size-3.5" />
			) : dir === "desc" ? (
				<ArrowDownIcon className="size-3.5" />
			) : (
				<SortVerticalIcon className="size-3.5 opacity-40" />
			)}
		</button>
	);
}

function Stats({
	grade,
	quizzes,
	time,
}: {
	grade: number;
	quizzes: number;
	time: number;
}) {
	return (
		<span className="ml-auto flex items-center gap-4 ps-3 tabular-nums sm:gap-6">
			<span
				className={cn(
					"flex w-20 items-center justify-end font-semibold",
					getGradeColor(grade)
				)}
			>
				{formatGradeOutOf33(grade)}
			</span>
			<span className="text-muted-foreground flex w-16 items-center justify-end">
				{quizzes}
			</span>
			<span className="text-muted-foreground hidden w-28 items-center justify-end sm:flex">
				{formatTimeSpent(time)}
			</span>
		</span>
	);
}

export function ProgressRollup({ courses }: { courses: RollupCourse[] }) {
	// Which nodes the user has flipped, not which are open: a set seeded from
	// `courses` would leave a course that arrives on a later refetch collapsed
	// alone, with nothing to explain why.
	const [flipped, setFlipped] = useState<Set<string>>(() => new Set());
	const [sort, setSort] = useState<Sort>({ key: "name", dir: "asc" });

	const toggle = (id: string) =>
		setFlipped(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	// A header click sorts ascending, then toggles direction on repeat — the same
	// asc → desc → asc cycle the DataTable uses (no "unsorted" state).
	const onSort = (key: SortKey) =>
		setSort(prev =>
			prev.key === key
				? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
				: { key, dir: "asc" }
		);

	const rows = useMemo(() => {
		const expanded = (id: string, byDefault: boolean) => flipped.has(id) !== byDefault;
		const result: Row[] = [];
		for (const course of sortNodes(courses, sort)) {
			const courseOpen = expanded(course.id, true);
			result.push({
				node: course,
				level: "course",
				expandable: true,
				open: courseOpen,
				guides: [],
			});
			if (!courseOpen) continue;
			const classes = sortNodes(course.classes, sort);
			for (let ci = 0; ci < classes.length; ci++) {
				const klass = classes[ci]!;
				const classContinues = ci < classes.length - 1;
				const classOpen = expanded(klass.id, false);
				result.push({
					node: klass,
					level: "class",
					expandable: true,
					open: classOpen,
					guides: [classContinues],
				});
				if (!classOpen) continue;
				const sections = sortNodes(klass.sections, sort);
				for (let si = 0; si < sections.length; si++) {
					result.push({
						node: sections[si]!,
						level: "section",
						expandable: false,
						open: false,
						guides: [classContinues, si < sections.length - 1],
					});
				}
			}
		}
		return result;
	}, [courses, flipped, sort]);

	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold">Per corso</h2>
			<Card className="bg-muted/30 overflow-hidden p-1">
				<div className="bg-card overflow-hidden rounded-xl border">
					<CardContent className="px-3 py-3">
						{courses.length === 0 ? (
							<InlineEmpty>Nessun quiz ancora legato a un corso.</InlineEmpty>
						) : (
							<>
								<div className="flex items-center gap-1.5 pe-1 pb-2.5 text-xs">
									<SortHeader label="Nome" sortKey="name" sort={sort} onSort={onSort} />
									<span className="ml-auto flex items-center gap-4 ps-3 sm:gap-6">
										<SortHeader
											label="Voto"
											icon={GraphUpIcon}
											sortKey="grade"
											sort={sort}
											onSort={onSort}
											className="w-20 justify-end"
										/>
										<SortHeader
											label="Quiz"
											icon={CupFirstIcon}
											sortKey="quizzes"
											sort={sort}
											onSort={onSort}
											className="w-16 justify-end"
										/>
										<SortHeader
											label="Tempo"
											icon={ClockCircleIcon}
											sortKey="time"
											sort={sort}
											onSort={onSort}
											className="hidden w-28 justify-end sm:flex"
										/>
									</span>
								</div>
								<Tree indent={20} lines className="text-sm">
									{rows.map(({ node, level, expandable, open: isOpen, guides }) => (
										<TreeItem
											key={node.id}
											level={DEPTH[level]}
											guides={guides}
											reach={level === "section" ? 24 : 0}
										>
											<div
												className={cn(
													"flex items-center gap-1.5 rounded-lg py-2 pe-1",
													BAND[level]
												)}
											>
												{expandable && (
													<button
														type="button"
														onClick={() => toggle(node.id)}
														aria-label={isOpen ? "Comprimi" : "Espandi"}
														className="hover:bg-background/60 -my-0.5 rounded-lg p-1"
													>
														<AltArrowDownIcon
															className={cn(
																"text-muted-foreground size-4 transition-transform",
																!isOpen && "-rotate-90"
															)}
														/>
													</button>
												)}
												<LevelIcon level={level} />
												{node.name === EXAM_SIMULATION_SECTION ? (
													// The exam sentinel isn't a real page — plain text, no link.
													<span className="text-muted-foreground truncate">
														{sectionDisplayName(node.name)}
													</span>
												) : (
													<Link
														to={ROUTE[level]}
														params={{ id: node.id }}
														className="truncate hover:underline"
													>
														{node.name}
													</Link>
												)}
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
				</div>
			</Card>
		</div>
	);
}
