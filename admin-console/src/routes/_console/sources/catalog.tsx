import { useMemo } from "react";

import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { LibraryIcon } from "@solar-icons/react/linear/library";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
	DataTable,
	type DataTableFacetOption,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import { InlineEmpty } from "@/components/ui/empty-state";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { formatAcademicYear } from "@/lib/catalog/academic-year";

import { CourseSheet } from "~/components/catalog/course-sheet";
import { ConsolePage } from "~/components/console-page";
import { FigureCard } from "~/components/figure-card";
import { catalogQueries } from "~/lib/catalog/queries";
import type { CatalogCourse } from "~/lib/catalog/types";
import { formatDateTime, formatNumber, formatPercent } from "~/lib/format";

export const Route = createFileRoute("/_console/sources/catalog")({
	validateSearch: z.object({
		...dataTableSearchFields,
		department: dataTableFilterField,
		courseType: dataTableFilterField,
		detail: z.string().optional().catch(undefined),
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(catalogQueries.overview()),
			context.queryClient.ensureQueryData(catalogQueries.courses()),
		]),
	component: CatalogPage,
});

const TYPE_OPTIONS: DataTableFacetOption[] = Object.entries(COURSE_TYPE_CONFIG).map(
	([value, { label }]) => ({ value, label })
);

const column = createDataTableColumns<CatalogCourse>();

function buildColumns(departments: DataTableFacetOption[]) {
	return [
		column.accessor("name", {
			header: "Corso",
			meta: { label: "Corso", cellClassName: "min-w-[16rem]" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-medium">{row.original.name}</p>
					<p className="text-muted-foreground font-mono text-xs">{row.original.code}</p>
				</div>
			),
		}),
		column.accessor("department", {
			header: "Dipartimento",
			filterFn: "facet",
			meta: {
				label: "Dipartimento",
				hideBelow: "md",
				facet: { options: departments, icon: LibraryIcon },
			},
		}),
		column.accessor("courseType", {
			header: "Tipo",
			filterFn: "facet",
			meta: {
				label: "Tipo",
				hideBelow: "lg",
				facet: { options: TYPE_OPTIONS, icon: DiplomaIcon },
			},
			cell: ({ row }) =>
				COURSE_TYPE_CONFIG[row.original.courseType]?.label ?? row.original.courseType,
		}),
		column.accessor("lastCohort", {
			header: "Ultima coorte",
			meta: { label: "Ultima coorte", align: "right" },
			cell: ({ row }) =>
				row.original.lastCohort ? formatAcademicYear(row.original.lastCohort) : "—",
		}),
		column.accessor("cohorts", {
			header: "Coorti",
			meta: { label: "Coorti", align: "right", hideBelow: "sm" },
		}),
		column.accessor("curricula", {
			header: "Curriculum",
			meta: { label: "Curriculum", align: "right", hideBelow: "lg" },
		}),
		column.accessor("planRows", {
			header: "Righe",
			meta: { label: "Righe", align: "right", hideBelow: "md" },
			cell: ({ row }) => formatNumber(row.original.planRows),
		}),
		column.accessor("linkedShare", {
			header: "Collegate",
			meta: { label: "Collegate", align: "right", hideBelow: "xl" },
			cell: ({ row }) => formatPercent(row.original.linkedShare),
		}),
		column.accessor("updatedAt", {
			header: "Aggiornato",
			meta: { label: "Aggiornato", align: "right", hideBelow: "xl" },
			cell: ({ row }) => (
				<span className="text-muted-foreground text-xs whitespace-nowrap">
					{formatDateTime(row.original.updatedAt)}
				</span>
			),
		}),
	];
}

function CatalogPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: overview } = useSuspenseQuery(catalogQueries.overview());
	const { data: courses } = useSuspenseQuery(catalogQueries.courses());

	const columns = useMemo(() => {
		const departments = [...new Set(courses.map(course => course.department))]
			.sort()
			.map(code => ({ value: code, label: code }));
		return buildColumns(departments);
	}, [courses]);

	const table = useDataTable({
		data: courses,
		columns,
		getRowId: row => row.id,
		resizableColumns: true,
		searchFn: (course, query) =>
			course.name.toLowerCase().includes(query) ||
			course.code.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	const openDetail = (detail: string | undefined) =>
		navigate({ search: prev => ({ ...prev, detail }), resetScroll: false });

	const withoutPlan = courses.filter(course => course.planRows === 0).length;

	return (
		<ConsolePage
			title="Corsi e piani"
			description="Il catalogo CINECA nello staging: per ogni corso, i piani dell'ultima coorte importata."
		>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<FigureCard
					label="Corsi"
					value={formatNumber(overview.courses)}
					hint={withoutPlan > 0 ? `${withoutPlan} senza piano` : "tutti con un piano"}
				/>
				<FigureCard
					label="Coorti"
					value={
						overview.firstCohort && overview.lastCohort
							? `${overview.firstCohort}–${overview.lastCohort}`
							: "—"
					}
					hint="anni di immatricolazione importati"
				/>
				<FigureCard
					label="Righe di piano"
					value={formatNumber(overview.planRows)}
					hint={`${formatNumber(overview.curricula)} curriculum`}
				/>
				<FigureCard
					label="Ultimo import"
					value={formatDateTime(overview.plansUpdatedAt)}
					hint="la riga di piano aggiornata più di recente"
				/>
			</div>

			<DataTable
				table={table}
				density="compact"
				toolbar={
					<DataTableToolbar
						table={table}
						filterVariant="inline"
						searchPlaceholder="Cerca corsi…"
					/>
				}
				empty={<InlineEmpty>Nessun corso trovato.</InlineEmpty>}
				onRowClick={row => openDetail(row.id)}
				rowLink={row => (
					<Link
						from={Route.fullPath}
						to="."
						search={prev => ({ ...prev, detail: row.id })}
						resetScroll={false}
						aria-label={`Apri ${row.name}`}
					/>
				)}
			/>

			<CourseSheet id={search.detail} onClose={() => openDetail(undefined)} />
		</ConsolePage>
	);
}
