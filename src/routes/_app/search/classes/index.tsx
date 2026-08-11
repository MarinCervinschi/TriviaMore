import { useMemo } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
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
import { browseQueries } from "@/lib/browse/queries";
import type { SearchClassResult } from "@/lib/browse/types";
import { staggerContainer, withReducedMotion } from "@/lib/motion";
import { seoHead } from "@/lib/seo";

const PAGE_SIZE = 10;

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	dept: z.string().optional().catch(undefined),
	course: z.string().optional().catch(undefined),
	year: z.coerce.number().optional().catch(undefined),
	mandatory: z.enum(["true", "false"]).optional().catch(undefined),
	page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/search/classes/")({
	validateSearch: searchSchema,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(browseQueries.departments()),
	head: () =>
		seoHead({
			title: "Cerca insegnamento",
			description: "Cerca insegnamenti per nome.",
			path: "/search/classes",
		}),
	component: SearchClassesPage,
});

const column = createDataTableColumns<SearchClassResult>();

// The API neither sorts nor filters on the client's behalf, so every column is
// display-only: the server owns the result order.
const columns = [
	column.accessor("name", {
		header: "Nome",
		enableSorting: false,
		meta: { label: "Nome", headerClassName: "w-[40%]" },
		cell: ({ row }) => (
			<Link
				to="/browse/$department/$course/$class"
				params={{
					department: row.original.course.department.code.toLowerCase(),
					course: row.original.course.code.toLowerCase(),
					class: row.original.code.toLowerCase(),
				}}
				className="block"
			>
				<span className="text-foreground group-hover:text-brand block font-medium transition-colors">
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
		enableSorting: false,
		meta: { label: "Codice", align: "center", hideBelow: "lg" },
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.code}
			</Badge>
		),
	}),
	column.accessor(cls => cls.course.code, {
		id: "course",
		header: "Corso",
		enableSorting: false,
		meta: { label: "Corso", align: "center", hideBelow: "lg" },
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.course.code}
			</Badge>
		),
	}),
	column.accessor("classYear", {
		header: "Anno",
		enableSorting: false,
		meta: {
			label: "Anno",
			align: "center",
			hideBelow: "md",
			cellClassName: "text-muted-foreground text-sm",
		},
		cell: ({ row }) => `${row.original.classYear}°`,
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
	column.accessor("mandatory", {
		header: "Tipo",
		enableSorting: false,
		meta: { label: "Tipo", align: "center", hideBelow: "sm" },
		cell: ({ row }) => (
			<Badge
				variant={row.original.mandatory ? "default" : "secondary"}
				className="text-xs"
			>
				{row.original.mandatory ? "Obbligatorio" : "A scelta"}
			</Badge>
		),
	}),
	column.accessor("sectionCount", {
		header: "Sezioni",
		enableSorting: false,
		meta: { label: "Sezioni", align: "center", cellClassName: "font-semibold" },
	}),
];

function SearchClassesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { q, dept, course, year, mandatory, page } = Route.useSearch();
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

	const { data: departmentCourses } = useQuery(
		browseQueries.departmentCourseList(dept)
	);

	const { data: availableYears } = useQuery(
		browseQueries.availableClassYears(dept, course)
	);

	const searchParams = useMemo(
		() => ({
			query: q || undefined,
			departmentId: dept || undefined,
			courseId: course || undefined,
			classYear: year,
			mandatory:
				mandatory === "true" ? true : mandatory === "false" ? false : undefined,
			page: currentPage,
			pageSize: PAGE_SIZE,
		}),
		[q, dept, course, year, mandatory, currentPage]
	);

	const hasFilters = !!(
		searchParams.query ||
		searchParams.departmentId ||
		searchParams.courseId ||
		searchParams.classYear !== undefined ||
		searchParams.mandatory !== undefined
	);

	const { data: response, isFetching } = useQuery(
		browseQueries.searchClasses(searchParams)
	);

	const results = response?.data;
	const totalItems = response?.total ?? 0;

	const table = useDataTable({
		data: results ?? [],
		columns,
		getRowId: row => `${row.id}-${row.code}`,
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

	const years = availableYears ?? [1, 2, 3];

	return (
		<div>
			<UserHero
				icon={BookIcon}
				title="Cerca insegnamento"
				description="Cerca insegnamenti per nome"
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
								placeholder="es. Analisi Matematica, Algoritmi, Basi di Dati..."
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
							onValueChange={v =>
								updateSearch({
									dept: v === "all" ? undefined : v,
									course: undefined,
									year: undefined,
								})
							}
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

						{dept && departmentCourses && departmentCourses.length > 0 && (
							<Select
								value={course ?? ""}
								onValueChange={v =>
									updateSearch({ course: v === "all" ? undefined : v, year: undefined })
								}
							>
								<SelectTrigger className="h-9 w-auto min-w-[180px] rounded-xl text-xs">
									<SelectValue placeholder="Tutti i corsi" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tutti i corsi</SelectItem>
									{departmentCourses.map(c => (
										<SelectItem key={c.id} value={c.id}>
											{c.code} — {c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						<Select
							value={year !== undefined ? String(year) : ""}
							onValueChange={v =>
								updateSearch({ year: v === "all" ? undefined : Number(v) })
							}
						>
							<SelectTrigger className="h-9 w-auto min-w-[130px] rounded-xl text-xs">
								<SelectValue placeholder="Tutti gli anni" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti gli anni</SelectItem>
								{years.map(y => (
									<SelectItem key={y} value={String(y)}>
										{y}° anno
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={mandatory ?? ""}
							onValueChange={v =>
								updateSearch({ mandatory: v === "all" ? undefined : v })
							}
						>
							<SelectTrigger className="h-9 w-auto min-w-[130px] rounded-xl text-xs">
								<SelectValue placeholder="Tutti i tipi" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i tipi</SelectItem>
								<SelectItem value="true">Obbligatorio</SelectItem>
								<SelectItem value="false">A scelta</SelectItem>
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
							Cerca un insegnamento per nome, oppure seleziona un filtro
						</p>
					</div>
				) : !response && isFetching ? (
					<SearchResultsSkeleton rows={5} />
				) : !results || results.length === 0 ? (
					<div className="bg-card rounded-2xl border p-12 text-center">
						<h3 className="text-lg font-semibold">Nessun insegnamento trovato</h3>
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
					<div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
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
										to="/browse/$department/$course/$class"
										params={{
											department: row.course.department.code.toLowerCase(),
											course: row.course.code.toLowerCase(),
											class: row.code.toLowerCase(),
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
