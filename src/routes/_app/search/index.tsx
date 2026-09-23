import { useEffect, useState } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { EraserIcon } from "@solar-icons/react/linear/eraser";
import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
	SearchFilterChips,
	SearchFilterMenu,
	type SearchFilterValues,
} from "@/components/browse/search-filters";
import { ClassResultRow, CourseResultRow } from "@/components/browse/search-result-row";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { SearchResultsSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { EmptyState, InlineEmpty } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TabNav } from "@/components/ui/tab-nav";
import { useDebounce } from "@/hooks/useDebounce";
import { browseQueries } from "@/lib/browse/queries";
import { seoHead } from "@/lib/seo";

/** How many of each kind the combined view shows before handing over to a tab. */
const PREVIEW = 5;
const PAGE_SIZE = 20;

const KINDS = ["tutto", "corsi", "insegnamenti"] as const;
type Kind = (typeof KINDS)[number];

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	tipo: z.enum(KINDS).optional().catch(undefined),
	dept: z.string().optional().catch(undefined),
	campus: z.string().optional().catch(undefined),
	type: z.string().optional().catch(undefined),
	anno: z.coerce.number().int().optional().catch(undefined),
	obbligatori: z.coerce.boolean().optional().catch(undefined),
	page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/search/")({
	validateSearch: searchSchema,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(browseQueries.departments()),
	head: () =>
		seoHead({
			title: "Cerca",
			description:
				"Cerca corsi di laurea e insegnamenti di UniMore per nome, codice o dipartimento.",
			path: "/search",
		}),
	component: SearchPage,
});

function SearchPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: departments } = useSuspenseQuery(browseQueries.departments());

	const kind: Kind = search.tipo ?? "tutto";
	const page = search.page ?? 1;

	const [text, setText] = useState(search.q ?? "");
	const debounced = useDebounce(text, 250);

	// The field owns the typing, the URL owns the search: push once the typing
	// settles, and follow the URL when it changes from elsewhere (a chip, the back
	// button) rather than fighting it.
	useEffect(() => {
		if ((search.q ?? "") !== debounced) {
			update({ q: debounced || undefined });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced]);

	useEffect(() => {
		setText(search.q ?? "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search.q]);

	function update(next: Record<string, unknown>) {
		navigate({
			search: prev => {
				const merged = { ...prev, ...next, page: undefined } as Record<string, unknown>;
				for (const key of Object.keys(merged)) {
					const value = merged[key];
					if (value === undefined || value === "" || value === false) {
						delete merged[key];
					}
				}
				return merged as never;
			},
			replace: true,
		});
	}

	const filters: SearchFilterValues = {
		dept: search.dept,
		campus: search.campus,
		type: search.type,
		anno: search.anno,
		obbligatori: search.obbligatori,
	};
	const activeCount = Object.values(filters).filter(v => v !== undefined).length;
	const asked = !!search.q || activeCount > 0;

	const { data: years = [] } = useQuery(browseQueries.availableClassYears(search.dept));
	const yearOptions = years.length > 0 ? years : [1, 2, 3];

	const goToPage = (next: number) =>
		navigate({
			search: prev => ({ ...prev, page: next > 1 ? next : undefined }) as never,
			replace: true,
		});

	const clearFilters = () =>
		update({
			dept: undefined,
			campus: undefined,
			type: undefined,
			anno: undefined,
			obbligatori: undefined,
		});

	// Both kinds run their own query — the two full-text indexes have no shared
	// score, so a single ranked list would need one invented. Grouped, each stays
	// the query it already was.
	const wantsCourses = kind !== "insegnamenti";
	const wantsClasses = kind !== "corsi";

	const coursesQuery = useQuery({
		...browseQueries.searchCourses({
			query: search.q,
			departmentId: search.dept,
			courseType: search.type,
			campus: search.campus,
			page: kind === "corsi" ? page : 1,
			pageSize: kind === "corsi" ? PAGE_SIZE : PREVIEW,
		}),
		enabled: wantsCourses && asked,
	});

	const classesQuery = useQuery({
		...browseQueries.searchClasses({
			query: search.q,
			departmentId: search.dept,
			campus: search.campus,
			classYear: search.anno,
			mandatory: search.obbligatori,
			page: kind === "insegnamenti" ? page : 1,
			pageSize: kind === "insegnamenti" ? PAGE_SIZE : PREVIEW,
		}),
		enabled: wantsClasses && asked,
	});

	const courses = coursesQuery.data;
	const classes = classesQuery.data;
	const loading = coursesQuery.isFetching || classesQuery.isFetching;
	const nothing =
		asked && !loading && (courses?.total ?? 0) === 0 && (classes?.total ?? 0) === 0;

	const tabs = [
		{ key: "tutto", label: "Tutto", badge: total(courses?.total, classes?.total) },
		{ key: "corsi", label: "Corsi", badge: courses?.total },
		{ key: "insegnamenti", label: "Insegnamenti", badge: classes?.total },
	].map(tab => ({
		...tab,
		badge: asked ? tab.badge : undefined,
		active: kind === tab.key,
		onSelect: () => update({ tipo: tab.key === "tutto" ? undefined : tab.key }),
	}));

	return (
		<div className="container space-y-5 py-6 pb-10">
			<PageToolbar
				title="Cerca nel catalogo"
				meta="Corsi di laurea e insegnamenti, in un posto solo."
			/>

			<div className="relative">
				<MagnifierIcon className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
				<Input
					value={text}
					onChange={event => setText(event.target.value)}
					placeholder="Cerca per nome o codice…"
					aria-label="Cerca nel catalogo"
					className="h-14 rounded-2xl pl-12 text-base"
				/>
			</div>

			{/*
			 * Tabs and chips share one wrapping flow, so the chips sit beside the tabs
			 * while there is room and drop below only when there is not. The funnel is
			 * outside it: dragged along by the wrap, the one control that is always
			 * needed would be the one that moves.
			 */}
			<div className="flex items-end justify-between gap-3">
				<div className="flex min-w-0 flex-wrap items-end gap-x-4 gap-y-2">
					<TabNav label="Tipo di risultato" tabs={tabs} />
					{activeCount > 0 && (
						/*
						 * mb-1, not mb-2: with items-end a tab sits pb-2.5 above the row
						 * bottom, so the centre of its 20px line is 20px up. A 32px chip
						 * needs 4px of margin to put its own centre there.
						 */
						<div className="mb-1 flex flex-wrap items-center gap-1.5">
							<SearchFilterChips
								values={filters}
								departments={departments}
								years={yearOptions}
								onChange={next => update(next)}
							/>
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="text-muted-foreground h-8"
							>
								<EraserIcon className="size-3.5" />
								Pulisci
							</Button>
						</div>
					)}
				</div>

				<div className="mb-2 shrink-0">
					<SearchFilterMenu
						values={filters}
						departments={departments}
						years={yearOptions}
						onChange={next => update(next)}
					/>
				</div>
			</div>

			{!asked ? (
				<EmptyState
					icon={MagnifierIcon}
					title="Cerca un corso o un insegnamento"
					description="Scrivi un nome o un codice. Puoi anche partire da un filtro, senza scrivere niente."
				/>
			) : nothing ? (
				<EmptyState
					icon={MagnifierIcon}
					title={search.q ? `Nessun risultato per “${search.q}”` : "Nessun risultato"}
					description={
						activeCount > 0
							? "Prova a togliere un filtro, oppure cerca in tutto il catalogo."
							: "Prova con un altro termine."
					}
					actionLabel={activeCount > 0 ? "Pulisci i filtri" : undefined}
					onAction={activeCount > 0 ? clearFilters : undefined}
				/>
			) : loading && !courses && !classes ? (
				<SearchResultsSkeleton rows={6} />
			) : (
				<div className="space-y-6">
					{wantsCourses && (
						<Group
							label="Corsi"
							icon={DiplomaIcon}
							total={courses?.total ?? 0}
							shown={courses?.data.length ?? 0}
							empty="Nessun corso corrisponde — gli insegnamenti qui sotto sì."
							onMore={kind === "tutto" ? () => update({ tipo: "corsi" }) : undefined}
							page={
								kind === "corsi"
									? { current: page, size: PAGE_SIZE, onChange: goToPage }
									: undefined
							}
						>
							{courses?.data.map(course => (
								<CourseResultRow key={course.id} course={course} />
							))}
						</Group>
					)}

					{wantsClasses && (
						<Group
							label="Insegnamenti"
							icon={BookIcon}
							total={classes?.total ?? 0}
							shown={classes?.data.length ?? 0}
							empty="Nessun insegnamento corrisponde — i corsi qui sopra sì."
							onMore={
								kind === "tutto" ? () => update({ tipo: "insegnamenti" }) : undefined
							}
							page={
								kind === "insegnamenti"
									? { current: page, size: PAGE_SIZE, onChange: goToPage }
									: undefined
							}
						>
							{classes?.data.map(klass => (
								<ClassResultRow key={`${klass.course.id}-${klass.id}`} klass={klass} />
							))}
						</Group>
					)}
				</div>
			)}
		</div>
	);
}

function total(a: number | undefined, b: number | undefined) {
	if (a === undefined && b === undefined) return undefined;
	return (a ?? 0) + (b ?? 0);
}

/**
 * One kind's results. With both on screen, a kind that matched nothing says so in
 * a line rather than taking the whole page: the other one still has results.
 */
function Group({
	label,
	icon: Icon,
	total,
	shown,
	empty,
	onMore,
	page,
	children,
}: {
	label: string;
	icon: typeof BookIcon;
	total: number;
	shown: number;
	empty: string;
	onMore?: () => void;
	page?: { current: number; size: number; onChange: (page: number) => void };
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<div className="flex items-baseline gap-2">
				<h2 className="eyebrow text-muted-foreground">{label}</h2>
				<span className="text-muted-foreground/70 text-xs">
					{total === 0 ? "nessuno" : `${total} risultati`}
				</span>
			</div>

			{total === 0 ? (
				<InlineEmpty>
					<span className="inline-flex items-center gap-2">
						<Icon className="size-4 shrink-0" aria-hidden />
						{empty}
					</span>
				</InlineEmpty>
			) : (
				<>
					<div className="space-y-2">{children}</div>
					{onMore && total > shown && (
						<div className="flex justify-center pt-1">
							<Button variant="outline" size="sm" onClick={onMore}>
								Mostra tutti i {total} {label.toLowerCase()}
							</Button>
						</div>
					)}
					{page && (
						<Pagination
							page={page.current}
							totalPages={Math.max(1, Math.ceil(total / page.size))}
							pageSize={page.size}
							totalItems={total}
							onPageChange={page.onChange}
						/>
					)}
				</>
			)}
		</section>
	);
}
