import { useEffect, useMemo, useState } from "react";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Search, X } from "lucide-react";
import { z } from "zod";

import { BrowseTable } from "@/components/browse/browse-table";
import { SearchResultsSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserHero } from "@/components/user/user-hero";
import { useDebounce } from "@/hooks/useDebounce";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion";
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
			title: "Cerca Corso",
			description: "Cerca corsi di laurea per nome o codice.",
			path: "/search/courses",
		}),
	component: SearchCoursesPage,
});

function SearchCoursesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { q, dept, type, campus, page } = Route.useSearch();
	const { data: departments } = useSuspenseQuery(browseQueries.departments());
	const prefersReduced = useReducedMotion();

	const currentPage = page ?? 1;

	// Local state for the search input keeps typing snappy: the URL (and the DB query)
	// are only updated after the debounce settles, instead of on every keystroke.
	const [localQ, setLocalQ] = useState(q ?? "");
	const debouncedQuery = useDebounce(localQ, 400);

	// Push debounced value into the URL.
	useEffect(() => {
		if (debouncedQuery !== (q ?? "")) {
			updateSearch({ q: debouncedQuery || undefined });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedQuery]);

	// Pull external URL changes (back/forward, clearFilters) back into local state.
	useEffect(() => {
		setLocalQ(q ?? "");
	}, [q]);

	const searchParams = useMemo(
		() => ({
			query: debouncedQuery || undefined,
			departmentId: dept || undefined,
			courseType: type || undefined,
			campus: campus || undefined,
			page: currentPage,
			pageSize: PAGE_SIZE,
		}),
		[debouncedQuery, dept, type, campus, currentPage]
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
	const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);

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

	const goToPage = (p: number) => {
		navigate({
			search: prev => ({ ...prev, page: p === 1 ? undefined : p }),
			replace: false,
		});
	};

	const clearFilters = () => {
		navigate({ search: {}, replace: true });
	};

	return (
		<div>
			<UserHero
				icon={GraduationCap}
				title="Cerca Corso"
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
							<Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
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
								<X className="mr-1.5 h-3.5 w-3.5" />
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
							<Search className="text-primary h-6 w-6" strokeWidth={1.5} />
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
							<BrowseTable
								headers={[
									"Nome",
									{ label: "Codice", className: "hidden md:table-cell" },
									{ label: "Dipartimento", className: "hidden lg:table-cell" },
									{ label: "Tipo", className: "hidden sm:table-cell" },
									{ label: "Campus", className: "hidden lg:table-cell" },
									{ label: "CFU", className: "hidden md:table-cell" },
									"Insegnamenti",
								]}
							>
								{results.map(course => {
									const typeConf = COURSE_TYPE_CONFIG[course.courseType];
									const classCount = course.classCount;
									return (
										<motion.tr
											key={course.id}
											variants={withReducedMotion(staggerItem, prefersReduced)}
											className="group"
										>
											<td className="py-4 pr-3 pl-6 align-top">
												<Link
													to="/browse/$department/$course"
													params={{
														department: course.department.code.toLowerCase(),
														course: course.code.toLowerCase(),
													}}
													className="block"
												>
													<span className="text-foreground group-hover:text-primary block font-medium transition-colors">
														{course.name}
													</span>
												</Link>
											</td>
											<td className="hidden px-3 py-4 text-center whitespace-nowrap md:table-cell">
												<Badge variant="outline" className="text-xs">
													{course.code}
												</Badge>
											</td>
											<td className="hidden px-3 py-4 text-center whitespace-nowrap lg:table-cell">
												<Badge variant="outline" className="text-xs">
													{course.department.code}
												</Badge>
											</td>
											<td className="hidden px-3 py-4 text-center whitespace-nowrap sm:table-cell">
												{typeConf ? (
													<Badge className={cn("text-xs", typeConf.className)}>
														{typeConf.label}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">
														{course.courseType}
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
													<span className="text-muted-foreground/50 text-xs">—</span>
												)}
											</td>
											<td className="hidden px-3 py-4 text-center whitespace-nowrap md:table-cell">
												{course.cfu ? (
													<span className="text-muted-foreground text-sm">
														{course.cfu}
													</span>
												) : (
													<span className="text-muted-foreground/50 text-xs">—</span>
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
														department: course.department.code.toLowerCase(),
														course: course.code.toLowerCase(),
													}}
													className="inline-flex"
													aria-label={`Apri ${course.name}`}
												>
													<ArrowRight className="text-muted-foreground/50 group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
												</Link>
											</td>
										</motion.tr>
									);
								})}
							</BrowseTable>
						</motion.div>
						{totalPages > 1 && (
							<Pagination
								page={safePage}
								totalPages={totalPages}
								onPageChange={goToPage}
								totalItems={totalItems}
								pageSize={PAGE_SIZE}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
