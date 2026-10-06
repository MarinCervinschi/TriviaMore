import { useMemo } from "react";

import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { BrowseAdminButton } from "@/components/admin/browse-admin-button";
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
import { PlanActivities } from "@/components/browse/plan-activities";
import { SearchFilter } from "@/components/browse/search-filter";
import {
	DataTable,
	createDataTableColumns,
	dataTableFilterField,
	useDataTable,
} from "@/components/data-table";
import { NotFoundPage } from "@/components/error/not-found-page";
import { CourseDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebouncedSearchParam } from "@/hooks/useDebouncedSearchParam";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { groupFor, inCurriculum } from "@/lib/browse/plan-view";
import { browseQueries } from "@/lib/browse/queries";
import type { PlanClass } from "@/lib/browse/types";
import { formatAcademicYear } from "@/lib/catalog/academic-year";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/json-ld";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_app/browse/$department/$course/")({
	validateSearch: z.object({
		q: dataTableFilterField,
		year: z.coerce.number().int().optional().catch(undefined),
		curriculum: dataTableFilterField,
		coorte: z.coerce.number().int().optional().catch(undefined),
	}),
	loaderDeps: ({ search }) => ({ coorte: search.coorte }),
	loader: async ({ context, params, deps }) => {
		const data = await context.queryClient.ensureQueryData(
			browseQueries.course(params.department, params.course, deps.coorte)
		);
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, match }) => ({
		...seoHead({
			title: loaderData?.name ?? "Corso",
			description:
				loaderData?.description ??
				`Insegnamenti del corso ${loaderData?.name ?? ""} a UniMore. Quiz, simulazioni d'esame, flashcard e dashboard personale per ogni esame.`,
			path: match.pathname,
			jsonLd: [
				breadcrumbJsonLd([
					{ name: "Esplora", path: "/browse" },
					{
						name: loaderData?.department?.name ?? "Dipartimento",
						path: `/browse/${match.params.department}`,
					},
					{ name: loaderData?.name ?? "Corso", path: match.pathname },
				]),
				courseJsonLd({
					name: loaderData?.name ?? "Corso",
					description: loaderData?.description ?? undefined,
					path: match.pathname,
					provider: loaderData?.department?.name,
				}),
			],
		}),
	}),
	pendingComponent: CourseDetailSkeleton,
	component: CoursePage,
	notFoundComponent: () => (
		<NotFoundPage
			title="Corso non trovato"
			message="Il corso che stai cercando non esiste."
			withBand={false}
		/>
	),
});

const column = createDataTableColumns<PlanClass>();

function ClassName({ entry }: { entry: PlanClass }) {
	return (
		<>
			<span className="text-foreground group-hover:text-brand block font-medium transition-colors">
				{entry.name}
			</span>
			{entry.description && (
				<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
					{entry.description}
				</p>
			)}
		</>
	);
}

function buildColumns(deptCode: string, courseCode: string) {
	const linkParams = (classCode: string) => ({
		department: deptCode.toLowerCase(),
		course: courseCode.toLowerCase(),
		class: classCode.toLowerCase(),
	});

	return [
		column.accessor("name", {
			header: "Nome",
			meta: { label: "Nome", headerClassName: "w-[40%]" },
			cell: ({ row }) =>
				row.original.link ? (
					<Link
						to="/browse/$department/$course/$class"
						params={linkParams(row.original.link)}
						className="block"
					>
						<ClassName entry={row.original} />
					</Link>
				) : (
					<ClassName entry={row.original} />
				),
		}),
		column.accessor("code", {
			header: "Codice",
			meta: { label: "Codice", align: "center", hideBelow: "md" },
			cell: ({ row }) => (
				<Badge variant="outline" className="text-xs">
					{row.original.code}
				</Badge>
			),
		}),
		column.accessor("cfu", {
			header: "CFU",
			meta: { label: "CFU", align: "center", hideBelow: "sm" },
			cell: ({ row }) =>
				row.original.cfu ? (
					<span className="text-muted-foreground text-sm">{row.original.cfu}</span>
				) : (
					<span className="text-muted-foreground/50 text-xs">—</span>
				),
		}),
		column.accessor("sectionCount", {
			header: "Sezioni",
			meta: { label: "Sezioni", align: "center" },
			cell: ({ row }) =>
				row.original.link ? (
					<span className="text-muted-foreground text-sm">
						<span className="text-foreground font-semibold">
							{row.original.sectionCount}
						</span>{" "}
						{row.original.sectionCount === 1 ? "sezione" : "sezioni"}
					</span>
				) : (
					<span className="text-muted-foreground/70 text-xs">
						Non ancora su TriviaMore
					</span>
				),
		}),
	];
}

function ClassTable({
	classes,
	columns,
	deptCode,
	courseCode,
	paginated = false,
}: {
	classes: PlanClass[];
	columns: ReturnType<typeof buildColumns>;
	deptCode: string;
	courseCode: string;
	paginated?: boolean;
}) {
	const table = useDataTable({
		data: classes,
		columns,
		getRowId: row => row.id,
		pageSize: paginated ? PAGE_SIZE : Math.max(classes.length, 1),
	});

	return (
		<DataTable
			table={table}
			showPagination={paginated}
			rowLink={row =>
				row.link ? (
					<Link
						to="/browse/$department/$course/$class"
						params={{
							department: deptCode.toLowerCase(),
							course: courseCode.toLowerCase(),
							class: row.link.toLowerCase(),
						}}
						aria-label={`Apri ${row.name}`}
					/>
				) : null
			}
		/>
	);
}

function CoursePage() {
	const { department: deptCode, course: courseCode } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const { q, year, curriculum, coorte } = Route.useSearch();
	const { data: course } = useSuspenseQuery(
		browseQueries.course(deptCode, courseCode, coorte)
	);

	const [searchInput, setSearchInput] = useDebouncedSearchParam(q, next =>
		navigate({ search: prev => ({ ...prev, q: next }) })
	);

	const columns = useMemo(
		() => buildColumns(deptCode, courseCode),
		[deptCode, courseCode]
	);

	const classes = useMemo(() => course?.classes ?? [], [course]);

	const availableYears = useMemo(
		() => [...new Set(classes.map(c => c.classYear))].sort(),
		[classes]
	);

	const curricula = useMemo(() => course?.curricula ?? [], [course]);
	const activeCurriculum = curricula.some(c => c.code === curriculum)
		? curriculum
		: undefined;

	const preFiltered = useMemo(
		() =>
			classes.filter(
				c =>
					(year === undefined || c.classYear === year) &&
					inCurriculum(c, activeCurriculum)
			),
		[classes, year, activeCurriculum]
	);

	const searched = useMemo(() => {
		const query = (q ?? "").trim().toLowerCase();
		if (query === "") return preFiltered;
		return preFiltered.filter(
			c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
		);
	}, [preFiltered, q]);

	const activities = useMemo(() => {
		const query = (q ?? "").trim().toLowerCase();
		return (course?.activities ?? []).filter(
			a =>
				(year === undefined || a.classYear === year) &&
				inCurriculum(a, activeCurriculum) &&
				(query === "" || a.name.toLowerCase().includes(query))
		);
	}, [course, year, q, activeCurriculum]);

	const activityNotes = useMemo(() => {
		const names = new Map(curricula.map(c => [c.code, c.name]));
		const notes = new Map<string, string>();
		if (activeCurriculum !== undefined || curricula.length < 2) return notes;
		for (const activity of activities) {
			if (activity.curricula.length < curricula.length) {
				notes.set(
					activity.id,
					activity.curricula.map(c => names.get(c) ?? c).join(", ")
				);
			}
		}
		return notes;
	}, [activities, curricula, activeCurriculum]);

	const groupedClasses = useMemo(() => {
		const byYear = new Map<number, PlanClass[]>();
		for (const c of preFiltered) {
			byYear.set(c.classYear, [...(byYear.get(c.classYear) ?? []), c]);
		}
		return [...byYear.entries()]
			.sort(([a], [b]) => a - b)
			.map(([groupYear, yearClasses]) => {
				const blocks = new Map<
					string,
					{ label: string; position: number; classes: PlanClass[] }
				>();
				for (const c of yearClasses) {
					const group = groupFor(c, activeCurriculum);
					const block = blocks.get(group.label) ?? { ...group, classes: [] };
					block.classes.push(c);
					blocks.set(group.label, block);
				}
				return {
					year: groupYear,
					blocks: [...blocks.values()].sort((a, b) => a.position - b.position),
				};
			});
	}, [preFiltered, activeCurriculum]);

	if (!course) return null;

	// Grouping by year only makes sense when browsing; a query cuts across years.
	const isGroupedView = !q;

	return (
		<div className="pb-8">
			<BrowsePageHeader
				breadcrumb={
					<BrowseBreadcrumb
						segments={[
							{ label: "Esplora", href: "/browse" },
							{ label: course.department.name, href: `/browse/${deptCode}` },
						]}
						current={course.name}
					/>
				}
				icon={DiplomaIcon}
				title={course.name}
				description={course.description}
				badges={
					<>
						{COURSE_TYPE_CONFIG[course.courseType] && (
							<Badge
								className={cn(
									"text-xs",
									COURSE_TYPE_CONFIG[course.courseType].className
								)}
							>
								{COURSE_TYPE_CONFIG[course.courseType].label}
							</Badge>
						)}
						{course.location && (
							<Badge variant="outline" className="text-xs">
								{CAMPUS_LOCATION_CONFIG[course.location]?.short ?? course.location}
							</Badge>
						)}
						{course.cfu && (
							<Badge variant="secondary" className="text-xs">
								{course.cfu} CFU
							</Badge>
						)}
						{course.cohort !== null && (
							<Badge variant="outline" className="text-xs">
								Coorte {formatAcademicYear(course.cohort)}
							</Badge>
						)}
					</>
				}
				stats={[
					{
						label: course.classes.length === 1 ? "insegnamento" : "insegnamenti",
						value: course.classes.length,
					},
				]}
				actions={
					<BrowseAdminButton
						to="/admin/courses/$courseId"
						params={{ courseId: course.id }}
						courseId={course.id}
					/>
				}
			/>

			<div className="container">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
					{availableYears.length > 1 && (
						<div className="flex flex-wrap gap-2">
							{[undefined, ...availableYears].map(option => (
								<button
									key={option ?? "all"}
									onClick={() =>
										navigate({ search: prev => ({ ...prev, year: option }) })
									}
									className={cn(
										"rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
										year === option
											? "bg-primary/10 text-brand"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									{option === undefined ? "Tutti" : `Anno ${option}`}
								</button>
							))}
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						{course.cohort !== null && course.cohorts.length > 1 && (
							<Select
								value={String(course.cohort)}
								onValueChange={value =>
									navigate({
										search: prev => ({
											...prev,
											coorte: Number(value),
											curriculum: undefined,
										}),
									})
								}
							>
								<SelectTrigger className="w-auto min-w-[170px]" aria-label="Coorte">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{course.cohorts.map(option => (
										<SelectItem key={option} value={String(option)}>
											Coorte {formatAcademicYear(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						{curricula.length > 1 && (
							<Select
								value={activeCurriculum ?? "all"}
								onValueChange={value =>
									navigate({
										search: prev => ({
											...prev,
											curriculum: value === "all" ? undefined : value,
										}),
									})
								}
							>
								<SelectTrigger
									className="w-auto max-w-[300px] min-w-[200px]"
									aria-label="Curriculum"
								>
									<SelectValue placeholder="Tutti i curriculum" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tutti i curriculum</SelectItem>
									{curricula.map(option => (
										<SelectItem key={option.code} value={option.code}>
											{option.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				</div>

				<SearchFilter
					value={searchInput}
					onChange={setSearchInput}
					placeholder="Cerca insegnamenti..."
				/>

				{searched.length === 0 ? (
					<BrowseEmptyState message="Nessun insegnamento trovato." />
				) : isGroupedView ? (
					groupedClasses.map(group => (
						<section key={group.year} className="mt-8 first:mt-4">
							<h2 className="mb-4 text-lg font-semibold">Anno {group.year}</h2>
							{group.blocks.map(block => (
								<div key={block.label} className="mt-4 first:mt-0">
									{group.blocks.length > 1 && (
										<h3 className="text-muted-foreground mb-2 text-sm font-medium">
											{block.label}
										</h3>
									)}
									<ClassTable
										classes={block.classes}
										columns={columns}
										deptCode={deptCode}
										courseCode={courseCode}
									/>
								</div>
							))}
						</section>
					))
				) : (
					<ClassTable
						classes={searched}
						columns={columns}
						deptCode={deptCode}
						courseCode={courseCode}
						paginated
					/>
				)}

				<PlanActivities activities={activities} notes={activityNotes} />
			</div>
		</div>
	);
}
