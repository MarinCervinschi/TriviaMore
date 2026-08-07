import { Suspense, lazy, useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin } from "lucide-react";

import { BrowseAdminButton } from "@/components/admin/browse-admin-button";
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb";
import { BrowseEmptyState } from "@/components/browse/browse-empty-state";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
import { BrowseTable } from "@/components/browse/browse-table";
import { SearchFilter } from "@/components/browse/search-filter";
import { NotFoundPage } from "@/components/error/not-found-page";
import { DepartmentDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AREA_CONFIG,
	CAMPUS_LOCATION_CONFIG,
	COURSE_TYPE_CONFIG,
} from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const DepartmentMap = lazy(() =>
	import("@/components/browse/department-map").then(m => ({
		default: m.DepartmentMap,
	}))
);

export const Route = createFileRoute("/_app/browse/$department/")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData(
			browseQueries.department(params.department)
		);
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, match }) => ({
		...seoHead({
			title: loaderData?.name ?? "Dipartimento",
			description:
				loaderData?.description ??
				`Corsi e insegnamenti del ${loaderData?.name ?? "dipartimento"} (UniMore). Catalogo curato con quiz, simulazioni d'esame, flashcard e dashboard personale.`,
			path: match.pathname,
			jsonLd: breadcrumbJsonLd([
				{ name: "Esplora", path: "/browse" },
				{ name: loaderData?.name ?? "Dipartimento", path: match.pathname },
			]),
		}),
	}),
	pendingComponent: DepartmentDetailSkeleton,
	component: DepartmentPage,
	notFoundComponent: () => (
		<NotFoundPage message="Il dipartimento che stai cercando non esiste." />
	),
});

function DepartmentPage() {
	const { department: deptCode } = Route.useParams();
	const { data: department } = useSuspenseQuery(browseQueries.department(deptCode));

	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [pagesByType, setPagesByType] = useState<Record<string, number>>({});

	if (!department) return null;

	const PAGE_SIZE = 10;

	const courseTypeFilters = useMemo(() => {
		const types = new Set<string>(department.courses.map(c => c.courseType));
		return [
			{ value: "all", label: "Tutti" },
			...Object.entries(COURSE_TYPE_CONFIG)
				.filter(([value]) => types.has(value))
				.map(([value, { label }]) => ({ value, label })),
		];
	}, [department.courses]);

	const searched = useMemo(() => {
		const base =
			typeFilter === "all"
				? department.courses
				: department.courses.filter(c => c.courseType === typeFilter);
		const q = search.trim().toLowerCase();
		if (!q) return base;
		return base.filter(
			c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
		);
	}, [department.courses, typeFilter, search]);

	const groups = useMemo(() => {
		const order = ["BACHELOR", "MASTER", "SINGLE_CYCLE"];
		const map = new Map<string, typeof searched>();
		for (const course of searched) {
			const list = map.get(course.courseType) ?? [];
			list.push(course);
			map.set(course.courseType, list);
		}
		return [...map.entries()].sort(([a], [b]) => {
			const ai = order.indexOf(a);
			const bi = order.indexOf(b);
			return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
		});
	}, [searched]);

	return (
		<div className="pb-8">
			<BrowsePageHeader
				breadcrumb={
					<BrowseBreadcrumb
						segments={[{ label: "Esplora", href: "/browse" }]}
						current={department.name}
					/>
				}
				icon={Building2}
				title={department.name}
				description={department.description}
				badges={
					<>
						<Badge variant="outline" className="font-mono text-xs">
							{department.code}
						</Badge>
						{department.area && AREA_CONFIG[department.area] && (
							<Badge variant="secondary" className="text-xs">
								{AREA_CONFIG[department.area].label}
							</Badge>
						)}
						{department.locations.length > 0 && (
							<span className="text-muted-foreground flex items-center gap-1 text-xs">
								<MapPin className="h-3.5 w-3.5" />
								{[
									...new Set(
										department.locations.map(l => l.campusLocation).filter(Boolean)
									),
								]
									.map(c => CAMPUS_LOCATION_CONFIG[c!]?.label ?? c)
									.join(", ")}
							</span>
						)}
					</>
				}
				stats={[
					{
						label: department.courses.length === 1 ? "corso" : "corsi",
						value: department.courses.length,
					},
				]}
				actions={
					<BrowseAdminButton
						to="/admin/departments/$departmentId"
						params={{ departmentId: department.id }}
					/>
				}
			/>

			<div className="container">
				{department.locations.length > 0 && (
					<Suspense fallback={<Skeleton className="mb-6 h-[300px] w-full" />}>
						<DepartmentMap locations={department.locations} />
					</Suspense>
				)}

				{courseTypeFilters.length > 2 && (
					<div className="mb-4 flex flex-wrap gap-2">
						{courseTypeFilters.map(f => (
							<button
								key={f.value}
								onClick={() => {
									setTypeFilter(f.value);
									setPagesByType({});
								}}
								className={cn(
									"rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
									typeFilter === f.value
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								)}
							>
								{f.label}
							</button>
						))}
					</div>
				)}

				<SearchFilter
					value={search}
					onChange={v => {
						setSearch(v);
						setPagesByType({});
					}}
					placeholder="Cerca corsi..."
				/>

				{searched.length === 0 ? (
					<BrowseEmptyState message="Nessun corso trovato." />
				) : (
					<div className="space-y-10">
						{groups.map(([type, courses]) => {
							const groupConf = COURSE_TYPE_CONFIG[type];
							const page = pagesByType[type] ?? 1;
							const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
							const safePage = Math.min(page, totalPages);
							const pagedCourses = courses.slice(
								(safePage - 1) * PAGE_SIZE,
								safePage * PAGE_SIZE
							);
							return (
								<section key={type}>
									<div className="mb-3 flex items-center gap-2">
										<h2 className="text-lg font-semibold tracking-tight">
											{groupConf?.label ?? type}
										</h2>
										<span className="text-muted-foreground text-xs">
											{courses.length} {courses.length === 1 ? "corso" : "corsi"}
										</span>
									</div>
									<BrowseTable
										headers={[
											"Nome",
											{ label: "Codice", className: "hidden md:table-cell" },
											{ label: "CFU", className: "hidden sm:table-cell" },
											{ label: "Sede", className: "hidden lg:table-cell" },
											"Insegnamenti",
										]}
									>
										{pagedCourses.map(course => {
											const classCount = course.classCount;
											return (
												<tr key={course.id} className="group">
													<td className="py-4 pr-3 pl-6 align-top">
														<Link
															to="/browse/$department/$course"
															params={{
																department: deptCode.toLowerCase(),
																course: course.code.toLowerCase(),
															}}
															className="block"
														>
															<span className="text-foreground group-hover:text-primary block font-medium transition-colors">
																{course.name}
															</span>
															{course.description && (
																<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
																	{course.description}
																</p>
															)}
														</Link>
													</td>
													<td className="hidden px-3 py-4 text-center whitespace-nowrap md:table-cell">
														<Badge variant="outline" className="text-xs">
															{course.code}
														</Badge>
													</td>
													<td className="hidden px-3 py-4 text-center whitespace-nowrap sm:table-cell">
														{course.cfu ? (
															<span className="text-muted-foreground text-sm">
																{course.cfu}
															</span>
														) : (
															<span className="text-muted-foreground/50 text-xs">
																—
															</span>
														)}
													</td>
													<td className="hidden px-3 py-4 text-center whitespace-nowrap lg:table-cell">
														{course.location ? (
															<span className="text-muted-foreground text-sm">
																{CAMPUS_LOCATION_CONFIG[course.location]?.short ??
																	course.location}
															</span>
														) : (
															<span className="text-muted-foreground/50 text-xs">
																—
															</span>
														)}
													</td>
													<td className="px-3 py-4 text-center whitespace-nowrap">
														<span className="text-foreground text-sm font-semibold">
															{classCount}
														</span>
													</td>
													<td className="py-4 pr-6">
														<Link
															to="/browse/$department/$course"
															params={{
																department: deptCode.toLowerCase(),
																course: course.code.toLowerCase(),
															}}
															className="inline-flex"
															aria-label={`Apri ${course.name}`}
														>
															<ArrowRight className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
														</Link>
													</td>
												</tr>
											);
										})}
									</BrowseTable>
									{courses.length > PAGE_SIZE && (
										<Pagination
											page={safePage}
											totalPages={totalPages}
											onPageChange={p =>
												setPagesByType(prev => ({ ...prev, [type]: p }))
											}
											totalItems={courses.length}
											pageSize={PAGE_SIZE}
										/>
									)}
								</section>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
