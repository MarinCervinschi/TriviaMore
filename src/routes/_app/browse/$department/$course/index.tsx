import { useMemo } from "react";

import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { BrowseAdminButton } from "@/components/admin/browse-admin-button";
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
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
import { browseQueries } from "@/lib/browse/queries";
import type { BrowseClassInCourse } from "@/lib/browse/types";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/json-ld";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_app/browse/$department/$course/")({
	validateSearch: z.object({
		q: dataTableFilterField,
		year: z.coerce.number().int().optional().catch(undefined),
		curriculum: dataTableFilterField,
	}),
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

const column = createDataTableColumns<BrowseClassInCourse>();

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
			cell: ({ row }) => (
				<Link
					to="/browse/$department/$course/$class"
					params={linkParams(row.original.code)}
					className="block"
				>
					<span className="text-foreground group-hover:text-primary block font-medium transition-colors">
						{row.original.name}
					</span>
					{row.original.description && (
						<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
							{row.original.description}
						</p>
					)}
				</Link>
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
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					<span className="text-foreground font-semibold">
						{row.original.sectionCount}
					</span>{" "}
					{row.original.sectionCount === 1 ? "sezione" : "sezioni"}
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
	classes: BrowseClassInCourse[];
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
			rowLink={row => (
				<Link
					to="/browse/$department/$course/$class"
					params={{
						department: deptCode.toLowerCase(),
						course: courseCode.toLowerCase(),
						class: row.code.toLowerCase(),
					}}
					aria-label={`Apri ${row.name}`}
				/>
			)}
		/>
	);
}

function CoursePage() {
	const { department: deptCode, course: courseCode } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const { q, year, curriculum } = Route.useSearch();
	const { data: course } = useSuspenseQuery(browseQueries.course(deptCode, courseCode));

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

	const availableCurricula = useMemo(
		() =>
			[
				...new Set(classes.map(c => c.curriculum).filter((c): c is string => !!c)),
			].sort(),
		[classes]
	);

	const preFiltered = useMemo(
		() =>
			classes.filter(
				c =>
					(year === undefined || c.classYear === year) &&
					(curriculum === undefined || c.curriculum === curriculum)
			),
		[classes, year, curriculum]
	);

	const searched = useMemo(() => {
		const query = (q ?? "").trim().toLowerCase();
		if (query === "") return preFiltered;
		return preFiltered.filter(
			c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
		);
	}, [preFiltered, q]);

	const groupedClasses = useMemo(() => {
		const byYear = new Map<number, BrowseClassInCourse[]>();
		for (const c of preFiltered) {
			byYear.set(c.classYear, [...(byYear.get(c.classYear) ?? []), c]);
		}
		return [...byYear.entries()]
			.sort(([a], [b]) => a - b)
			.map(([groupYear, yearClasses]) => ({
				year: groupYear,
				mandatory: yearClasses.filter(c => c.mandatory),
				elective: yearClasses.filter(c => !c.mandatory),
			}));
	}, [preFiltered]);

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
							{[undefined, ...availableYears].map(option => (
								<button
									key={option ?? "all"}
									onClick={() =>
										navigate({ search: prev => ({ ...prev, year: option }) })
									}
									className={cn(
										"rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
										year === option
											? "bg-primary/10 text-primary"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									{option === undefined ? "Tutti" : `Anno ${option}`}
								</button>
							))}
						</div>
					)}

					{availableCurricula.length > 0 && (
						<Select
							value={curriculum ?? "all"}
							onValueChange={value =>
								navigate({
									search: prev => ({
										...prev,
										curriculum: value === "all" ? undefined : value,
									}),
								})
							}
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
					value={searchInput}
					onChange={setSearchInput}
					placeholder="Cerca insegnamenti..."
				/>

				{searched.length === 0 ? (
					<BrowseEmptyState message="Nessun insegnamento trovato." />
				) : isGroupedView ? (
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
										<ClassTable
											classes={group.mandatory}
											columns={columns}
											deptCode={deptCode}
											courseCode={courseCode}
										/>
									</>
								)}
								{group.elective.length > 0 && (
									<>
										{hasBoth && (
											<h3 className="text-muted-foreground mt-4 mb-2 text-sm font-medium">
												A scelta
											</h3>
										)}
										<ClassTable
											classes={group.elective}
											columns={columns}
											deptCode={deptCode}
											courseCode={courseCode}
										/>
									</>
								)}
							</section>
						);
					})
				) : (
					<ClassTable
						classes={searched}
						columns={columns}
						deptCode={deptCode}
						courseCode={courseCode}
						paginated
					/>
				)}
			</div>
		</div>
	);
}
