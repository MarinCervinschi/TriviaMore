import { useMemo } from "react";

import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";

import {
	DataTable,
	createDataTableColumns,
	useDataTable,
} from "@/components/data-table";
import { CloseGlyph } from "@/components/icons";
import { SearchResultsSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserHero } from "@/components/user/user-hero";
import { useDebouncedSearchParam } from "@/hooks/useDebouncedSearchParam";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import type { SearchCourseResult } from "@/lib/browse/types";
import { staggerContainer, withReducedMotion } from "@/lib/motion";
import { seoHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	dept: z.string().optional().catch(undefined),
	type: z.string().optional().catch(undefined),
	campus: z.string().optional().catch(undefined),
	page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/search/courses/")({
	validateSearch: searchSchema,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(browseQueries.departments()),
	head: () =>
		seoHead({
			title: "Cerca corso",
			description: "Cerca corsi di laurea per nome o codice.",
			path: "/search/courses",
		}),
	component: SearchCoursesPage,
});

const column = createDataTableColumns<SearchCourseResult>();

// The API neither sorts nor filters on the client's behalf, so every column is
// display-only: the server owns the result order.
const columns = [
	column.accessor("name", {
		header: "Nome",
		enableSorting: false,
		meta: { label: "Nome", headerClassName: "w-[40%]" },
		cell: ({ row }) => (
			<Link
				to="/browse/$department/$course"
				params={{
					department: row.original.department.code.toLowerCase(),
					course: row.original.code.toLowerCase(),
				}}
				className="block"
			>
				<span className="text-foreground group-hover:text-brand block font-medium transition-colors">
					{row.original.name}
				</span>
			</Link>
		),
	}),
	column.accessor("code", {
		header: "Codice",
		enableSorting: false,
		meta: { label: "Codice", align: "center", hideBelow: "md" },
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.code}
			</Badge>
		),
	}),
	column.accessor(course => course.department.code, {
		id: "department",
		header: "Dipartimento",
		enableSorting: false,
		meta: { label: "Dipartimento", align: "center", hideBelow: "lg" },
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.department.code}
			</Badge>
		),
	}),
	column.accessor("courseType", {
		header: "Tipo",
		enableSorting: false,
		meta: { label: "Tipo", align: "center", hideBelow: "sm" },
		cell: ({ row }) => {
			const config = COURSE_TYPE_CONFIG[row.original.courseType];
			return config ? (
				<Badge className={cn("text-xs", config.className)}>{config.label}</Badge>
			) : (
				<span className="text-muted-foreground text-xs">{row.original.courseType}</span>
			);
		},
	}),
	column.accessor("location", {
		header: "Campus",
		enableSorting: false,
		meta: { label: "Campus", align: "center", hideBelow: "lg" },
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
	column.accessor("cfu", {
		header: "CFU",
		enableSorting: false,
		meta: { label: "CFU", align: "center", hideBelow: "md" },
		cell: ({ row }) =>
			row.original.cfu ? (
				<span className="text-muted-foreground text-sm">{row.original.cfu}</span>
			) : (
				<span className="text-muted-foreground/50 text-xs">—</span>
			),
	}),
	column.accessor("classCount", {
		header: "Insegnamenti",
		enableSorting: false,
		meta: { label: "Insegnamenti", align: "center", cellClassName: "font-semibold" },
	}),
];

function SearchCoursesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { q, dept, type, campus, page } = Route.useSearch();
	const { data: departments } = useSuspenseQuery(browseQueries.departments());
	const prefersReduced = useReducedMotion();

	const currentPage = page ?? 1;

	// Filter changes reset to page 1; pagination clicks preserve all other filters.
	const updateSearch = (updates: Record<string, string | number | undefined>) => {
		navigate({
			search: prev => {
				const next = { ...prev, ...updates, page: undefined } as Record<
					string,
					string | number | undefined
				>;
				for (const key of Object.keys(next)) {
					const val = next[key];
					if (val === undefined || val === "") delete next[key];
				}
				return next;
			},
			replace: true,
		});
	};

	const clearFilters = () => {
		navigate({ search: {}, replace: true });
	};

	const [localQ, setLocalQ] = useDebouncedSearchParam(q, next =>
		updateSearch({ q: next })
	);

	const searchParams = useMemo(
		() => ({
			query: q || undefined,
			departmentId: dept || undefined,
			courseType: type || undefined,
			campus: campus || undefined,
			page: currentPage,
			pageSize: PAGE_SIZE,
		}),
		[q, dept, type, campus, currentPage]
	);

	const hasFilters = !!(
		searchParams.query ||
		searchParams.departmentId ||
		searchParams.courseType ||
		searchParams.campus
	);

	const { data: response, isFetching } = useQuery(
		browseQueries.searchCourses(searchParams)
	);

	const results = response?.data;
	const totalItems = response?.total ?? 0;

	const table = useDataTable({
		data: results ?? [],
		columns,
		getRowId: row => row.id,
		pageSize: PAGE_SIZE,
		manual: {
			pageCount: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
			rowCount: totalItems,
		},
		urlState: {
			values: { page },
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div>
			<UserHero
				icon={DiplomaIcon}
				title="Cerca corso"
				description="Cerca corsi di laurea per nome o codice"
				stats={
					hasFilters && results
						? [{ label: "risultati", value: totalItems }]
						: undefined
				}
			/>

			<div className="container py-8">
				{/* Search & Filters toolbar */}
				<div className="mb-6 space-y-3">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<MagnifierIcon className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
							<Input
								type="search"
								placeholder="es. Informatica, Economia, LM-32..."
								value={localQ}
								onChange={e => setLocalQ(e.target.value)}
								className="h-10 rounded-xl pl-10"
							/>
						</div>
						{hasFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="text-muted-foreground shrink-0"
							>
								<CloseGlyph className="mr-1.5 h-3.5 w-3.5" />
								Pulisci filtri
							</Button>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={dept ?? ""}
							onValueChange={v => updateSearch({ dept: v === "all" ? undefined : v })}
						>
							<SelectTrigger className="h-9 w-auto min-w-[180px] rounded-xl text-xs">
								<SelectValue placeholder="Tutti i dipartimenti" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i dipartimenti</SelectItem>
								{departments.map(d => (
									<SelectItem key={d.id} value={d.id}>
										{d.code} — {d.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={type ?? ""}
							onValueChange={v => updateSearch({ type: v === "all" ? undefined : v })}
						>
							<SelectTrigger className="h-9 w-auto min-w-[140px] rounded-xl text-xs">
								<SelectValue placeholder="Tutti i tipi" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i tipi</SelectItem>
								{Object.entries(COURSE_TYPE_CONFIG).map(([value, { label }]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={campus ?? ""}
							onValueChange={v => updateSearch({ campus: v === "all" ? undefined : v })}
						>
							<SelectTrigger className="h-9 w-auto min-w-[140px] rounded-xl text-xs">
								<SelectValue placeholder="Tutti i campus" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i campus</SelectItem>
								{Object.entries(CAMPUS_LOCATION_CONFIG).map(([value, { label }]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Results */}
				{!hasFilters ? (
					<div className="bg-card rounded-2xl border p-12 text-center">
						<div className="bg-primary/10 mx-auto mb-4 inline-flex rounded-2xl p-3">
							<MagnifierIcon className="text-brand h-6 w-6" />
						</div>
						<h3 className="text-lg font-semibold">Inizia a cercare</h3>
						<p className="text-muted-foreground mt-1 text-sm">
							Cerca un corso per nome o codice, oppure seleziona un filtro
						</p>
					</div>
				) : !response && isFetching ? (
					<SearchResultsSkeleton rows={5} />
				) : !results || results.length === 0 ? (
					<div className="bg-card rounded-2xl border p-12 text-center">
						<h3 className="text-lg font-semibold">Nessun corso trovato</h3>
						<p className="text-muted-foreground mt-1 text-sm">
							Prova a modificare i filtri o il termine di ricerca
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={clearFilters}
							className="mt-4 rounded-xl"
						>
							Pulisci filtri
						</Button>
					</div>
				) : (
					<div className={cn(isFetching && "opacity-60 transition-opacity")}>
						<div className="mb-3 flex items-center justify-between">
							<p className="text-muted-foreground text-sm">
								<span className="text-foreground font-semibold">{totalItems}</span>{" "}
								{totalItems === 1 ? "risultato" : "risultati"}
							</p>
						</div>
						<motion.div
							variants={withReducedMotion(staggerContainer, prefersReduced)}
							initial="hidden"
							animate="visible"
						>
							<DataTable
								table={table}
								rowLink={row => (
									<Link
										to="/browse/$department/$course"
										params={{
											department: row.department.code.toLowerCase(),
											course: row.code.toLowerCase(),
										}}
										aria-label={`Apri ${row.name}`}
									/>
								)}
							/>
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}
