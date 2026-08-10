import { Suspense, lazy, useMemo } from "react";

import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { MapPointIcon } from "@solar-icons/react/linear/map-point";
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
import { DepartmentDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedSearchParam } from "@/hooks/useDebouncedSearchParam";
import {
	AREA_CONFIG,
	CAMPUS_LOCATION_CONFIG,
	COURSE_TYPE_CONFIG,
} from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import type { BrowseCourse } from "@/lib/browse/types";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const DepartmentMap = lazy(() =>
	import("@/components/browse/department-map").then(m => ({
		default: m.DepartmentMap,
	}))
);

const PAGE_SIZE = 10;
const TYPE_ORDER = ["BACHELOR", "MASTER", "SINGLE_CYCLE"];

export const Route = createFileRoute("/_app/browse/$department/")({
	validateSearch: z.object({
		q: dataTableFilterField,
		type: dataTableFilterField,
	}),
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

const column = createDataTableColumns<BrowseCourse>();

function buildColumns(deptCode: string) {
	return [
		column.accessor("name", {
			header: "Nome",
			meta: { label: "Nome", headerClassName: "w-[40%]" },
			cell: ({ row }) => (
				<Link
					to="/browse/$department/$course"
					params={{
						department: deptCode.toLowerCase(),
						course: row.original.code.toLowerCase(),
					}}
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
		column.accessor("location", {
			header: "Sede",
			meta: { label: "Sede", align: "center", hideBelow: "lg" },
			cell: ({ row }) =>
				row.original.location ? (
					<span className="text-muted-foreground text-sm">
						{CAMPUS_LOCATION_CONFIG[row.original.location]?.short ??
							row.original.location}
					</span>
				) : (
					<span className="text-muted-foreground/50 text-xs">—</span>
				),
		}),
		column.accessor("classCount", {
			header: "Insegnamenti",
			meta: { label: "Insegnamenti", align: "center", cellClassName: "font-semibold" },
		}),
	];
}

function CourseGroupTable({
	courses,
	deptCode,
	columns,
}: {
	courses: BrowseCourse[];
	deptCode: string;
	columns: ReturnType<typeof buildColumns>;
}) {
	const table = useDataTable({
		data: courses,
		columns,
		getRowId: row => row.id,
		pageSize: PAGE_SIZE,
	});

	return (
		<DataTable
			table={table}
			rowLink={row => (
				<Link
					to="/browse/$department/$course"
					params={{
						department: deptCode.toLowerCase(),
						course: row.code.toLowerCase(),
					}}
					aria-label={`Apri ${row.name}`}
				/>
			)}
		/>
	);
}

function DepartmentPage() {
	const { department: deptCode } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const { q, type } = Route.useSearch();
	const { data: department } = useSuspenseQuery(browseQueries.department(deptCode));

	const typeFilter = type ?? "all";
	const [searchInput, setSearchInput] = useDebouncedSearchParam(q, next =>
		navigate({ search: prev => ({ ...prev, q: next }) })
	);

	const columns = useMemo(() => buildColumns(deptCode), [deptCode]);

	const courses = department?.courses ?? [];

	const courseTypeFilters = useMemo(() => {
		const types = new Set<string>(courses.map(c => c.courseType));
		return [
			{ value: "all", label: "Tutti" },
			...Object.entries(COURSE_TYPE_CONFIG)
				.filter(([value]) => types.has(value))
				.map(([value, { label }]) => ({ value, label })),
		];
	}, [courses]);

	const groups = useMemo(() => {
		const query = (q ?? "").trim().toLowerCase();
		const base = courses.filter(
			course =>
				(typeFilter === "all" || course.courseType === typeFilter) &&
				(query === "" ||
					course.name.toLowerCase().includes(query) ||
					course.code.toLowerCase().includes(query))
		);

		const byType = new Map<string, BrowseCourse[]>();
		for (const course of base) {
			byType.set(course.courseType, [...(byType.get(course.courseType) ?? []), course]);
		}

		return [...byType.entries()].sort(([a], [b]) => {
			const ai = TYPE_ORDER.indexOf(a);
			const bi = TYPE_ORDER.indexOf(b);
			return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
		});
	}, [courses, typeFilter, q]);

	if (!department) return null;

	return (
		<div className="pb-8">
			<BrowsePageHeader
				breadcrumb={
					<BrowseBreadcrumb
						segments={[{ label: "Esplora", href: "/browse" }]}
						current={department.name}
					/>
				}
				icon={BuildingsIcon}
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
								<MapPointIcon className="h-3.5 w-3.5" />
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
						{courseTypeFilters.map(filter => (
							<button
								key={filter.value}
								onClick={() =>
									navigate({
										search: prev => ({
											...prev,
											type: filter.value === "all" ? undefined : filter.value,
										}),
									})
								}
								className={cn(
									"rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
									typeFilter === filter.value
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								)}
							>
								{filter.label}
							</button>
						))}
					</div>
				)}

				<SearchFilter
					value={searchInput}
					onChange={setSearchInput}
					placeholder="Cerca corsi..."
				/>

				{groups.length === 0 ? (
					<BrowseEmptyState message="Nessun corso trovato." />
				) : (
					<div className="space-y-10">
						{groups.map(([groupType, groupCourses]) => (
							<section key={groupType}>
								<div className="mb-3 flex items-center gap-2">
									<h2 className="text-lg font-semibold tracking-tight">
										{COURSE_TYPE_CONFIG[groupType]?.label ?? groupType}
									</h2>
									<span className="text-muted-foreground text-xs">
										{groupCourses.length}{" "}
										{groupCourses.length === 1 ? "corso" : "corsi"}
									</span>
								</div>
								<CourseGroupTable
									courses={groupCourses}
									deptCode={deptCode}
									columns={columns}
								/>
							</section>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
