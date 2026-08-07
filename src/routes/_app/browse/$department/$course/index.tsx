import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, GraduationCap } from "lucide-react";

import { BrowseAdminButton } from "@/components/admin/browse-admin-button";
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
import { BrowseTable } from "@/components/browse/browse-table";
import { SearchFilter } from "@/components/browse/search-filter";
import { NotFoundPage } from "@/components/error/not-found-page";
import { CourseDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Pagination, usePaginatedSearch } from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import type { BrowseClassInCourse } from "@/lib/browse/types";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/json-ld";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/browse/$department/$course/")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData(
			browseQueries.course(params.department, params.course)
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
		<NotFoundPage message="Il corso che stai cercando non esiste." />
	),
});

function ClassRow({
	classData,
	deptCode,
	courseCode,
}: {
	classData: BrowseClassInCourse;
	deptCode: string;
	courseCode: string;
}) {
	const sectionCount = classData.sectionCount;
	return (
		<tr key={classData.id} className="group">
			<td className="py-4 pr-3 pl-6 align-top">
				<Link
					to="/browse/$department/$course/$class"
					params={{
						department: deptCode.toLowerCase(),
						course: courseCode.toLowerCase(),
						class: classData.code.toLowerCase(),
					}}
					className="block"
				>
					<span className="text-foreground group-hover:text-primary block font-medium transition-colors">
						{classData.name}
					</span>
					{classData.description && (
						<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
							{classData.description}
						</p>
					)}
				</Link>
			</td>
			<td className="hidden px-3 py-4 text-center whitespace-nowrap md:table-cell">
				<Badge variant="outline" className="text-xs">
					{classData.code}
				</Badge>
			</td>
			<td className="hidden px-3 py-4 text-center whitespace-nowrap sm:table-cell">
				{classData.cfu ? (
					<span className="text-muted-foreground text-sm">{classData.cfu}</span>
				) : (
					<span className="text-muted-foreground/50 text-xs">—</span>
				)}
			</td>
			<td className="text-muted-foreground px-3 py-4 text-center whitespace-nowrap">
				<span className="text-foreground font-semibold">{sectionCount}</span>{" "}
				{sectionCount === 1 ? "sezione" : "sezioni"}
			</td>
			<td className="py-4 pr-6">
				<Link
					to="/browse/$department/$course/$class"
					params={{
						department: deptCode.toLowerCase(),
						course: courseCode.toLowerCase(),
						class: classData.code.toLowerCase(),
					}}
					className="inline-flex"
					aria-label={`Apri ${classData.name}`}
				>
					<ArrowRight className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
				</Link>
			</td>
		</tr>
	);
}

function CoursePage() {
	const { department: deptCode, course: courseCode } = Route.useParams();
	const { data: course } = useSuspenseQuery(browseQueries.course(deptCode, courseCode));

	const [search, setSearch] = useState("");
	const [yearFilter, setYearFilter] = useState<number | "all">("all");
	const [curriculumFilter, setCurriculumFilter] = useState<string | "all">("all");
	const [page, setPage] = useState(1);

	if (!course) return null;

	const availableYears = useMemo(() => {
		const years = [...new Set(course.classes.map(c => c.classYear))].sort();
		return years;
	}, [course.classes]);

	const availableCurricula = useMemo(() => {
		const curricula = [
			...new Set(course.classes.map(c => c.curriculum).filter((c): c is string => !!c)),
		].sort();
		return curricula;
	}, [course.classes]);

	const preFiltered = course.classes.filter(
		c =>
			(yearFilter === "all" || c.classYear === yearFilter) &&
			(curriculumFilter === "all" || c.curriculum === curriculumFilter)
	);

	const groupedClasses = useMemo(() => {
		const byYear = new Map<number, BrowseClassInCourse[]>();
		for (const c of preFiltered) {
			const list = byYear.get(c.classYear) ?? [];
			list.push(c);
			byYear.set(c.classYear, list);
		}
		return [...byYear.entries()]
			.sort(([a], [b]) => a - b)
			.map(([year, classes]) => ({
				year,
				mandatory: classes.filter(c => c.mandatory),
				elective: classes.filter(c => !c.mandatory),
			}));
	}, [preFiltered]);

	const isGroupedView = search === "";

	const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
		preFiltered,
		(c, q) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
		search,
		page,
		10
	);

	const tableHeaders = [
		"Nome",
		{ label: "Codice", className: "hidden md:table-cell" },
		{ label: "CFU", className: "hidden sm:table-cell" },
		"Sezioni",
	];

	return (
		<div className="pb-8">
			<BrowsePageHeader
				breadcrumb={
					<BrowseBreadcrumb
						segments={[
							{ label: "Esplora", href: "/browse" },
							{
								label: course.department.name,
								href: `/browse/${deptCode}`,
							},
						]}
						current={course.name}
					/>
				}
				icon={GraduationCap}
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

			<div className="container pt-8">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
					{availableYears.length > 1 && (
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => {
									setYearFilter("all");
									setPage(1);
								}}
								className={cn(
									"rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
									yearFilter === "all"
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								)}
							>
								Tutti
							</button>
							{availableYears.map(year => (
								<button
									key={year}
									onClick={() => {
										setYearFilter(year);
										setPage(1);
									}}
									className={cn(
										"rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
										yearFilter === year
											? "bg-primary/10 text-primary"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									Anno {year}
								</button>
							))}
						</div>
					)}

					{availableCurricula.length > 0 && (
						<Select
							value={curriculumFilter}
							onValueChange={v => {
								setCurriculumFilter(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-auto max-w-[300px] min-w-[200px]">
								<SelectValue placeholder="Tutti i curriculum" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i curriculum</SelectItem>
								{availableCurricula.map(cur => (
									<SelectItem key={cur} value={cur}>
										{cur}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>

				<SearchFilter
					value={search}
					onChange={v => {
						setSearch(v);
						setPage(1);
					}}
					placeholder="Cerca insegnamenti..."
				/>

				{isGroupedView ? (
					preFiltered.length === 0 ? (
						<BrowseEmptyState message="Nessun insegnamento trovato." />
					) : (
						groupedClasses.map(group => {
							const hasBoth = group.mandatory.length > 0 && group.elective.length > 0;
							return (
								<section key={group.year} className="mt-8 first:mt-4">
									<h2 className="mb-4 text-lg font-semibold">Anno {group.year}</h2>
									{group.mandatory.length > 0 && (
										<>
											{hasBoth && (
												<h3 className="text-muted-foreground mb-2 text-sm font-medium">
													Obbligatori
												</h3>
											)}
											<BrowseTable headers={tableHeaders}>
												{group.mandatory.map(c => (
													<ClassRow
														key={c.id}
														classData={c}
														deptCode={deptCode}
														courseCode={courseCode}
													/>
												))}
											</BrowseTable>
										</>
									)}
									{group.elective.length > 0 && (
										<>
											{hasBoth && (
												<h3 className="text-muted-foreground mt-4 mb-2 text-sm font-medium">
													A scelta
												</h3>
											)}
											<BrowseTable headers={tableHeaders}>
												{group.elective.map(c => (
													<ClassRow
														key={c.id}
														classData={c}
														deptCode={deptCode}
														courseCode={courseCode}
													/>
												))}
											</BrowseTable>
										</>
									)}
								</section>
							);
						})
					)
				) : paged.length === 0 ? (
					<BrowseEmptyState message="Nessun insegnamento trovato." />
				) : (
					<>
						<BrowseTable headers={tableHeaders}>
							{paged.map(c => (
								<ClassRow
									key={c.id}
									classData={c}
									deptCode={deptCode}
									courseCode={courseCode}
								/>
							))}
						</BrowseTable>
						<Pagination
							page={safePage}
							totalPages={totalPages}
							onPageChange={setPage}
							totalItems={totalItems}
							pageSize={10}
						/>
					</>
				)}
			</div>
		</div>
	);
}
