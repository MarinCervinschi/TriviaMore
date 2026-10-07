import { useMemo } from "react";

import { BookIcon } from "@solar-icons/react/linear/book";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
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
import { InsetCard } from "@/components/ui/inset-card";
import { formatAcademicYear } from "@/lib/catalog/academic-year";

import { ClassSheet } from "~/components/catalog/class-sheet";
import { ConsolePage } from "~/components/console-page";
import { FigureCard } from "~/components/figure-card";
import { catalogQueries } from "~/lib/catalog/queries";
import type { CatalogClass } from "~/lib/catalog/types";
import { formatNumber, formatPercent } from "~/lib/format";

export const Route = createFileRoute("/_console/sources/classes")({
	validateSearch: z.object({
		...dataTableSearchFields,
		department: dataTableFilterField,
		course: dataTableFilterField,
		studiable: dataTableFilterField,
		sheet: dataTableFilterField,
		detail: z.string().optional().catch(undefined),
	}),
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(catalogQueries.classes()),
			context.queryClient.ensureQueryData(catalogQueries.courses()),
		]),
	component: ClassesPage,
});

const NO_SHEET = "none";

const STUDIABLE_OPTIONS: DataTableFacetOption[] = [
	{ value: "yes", label: "Studiabile" },
	{ value: "no", label: "Non studiabile" },
];

const sheetOf = (row: CatalogClass) =>
	row.syllabusYear === null ? NO_SHEET : String(row.syllabusYear);

const column = createDataTableColumns<CatalogClass>();

function buildColumns(
	departments: DataTableFacetOption[],
	courses: DataTableFacetOption[],
	sheets: DataTableFacetOption[]
) {
	return [
		column.accessor("name", {
			header: "Insegnamento",
			meta: { label: "Insegnamento", cellClassName: "min-w-[16rem]" },
			cell: ({ row }) => (
				<div className="min-w-0">
					<p className="truncate font-medium">{row.original.name}</p>
					{row.original.code && (
						<p className="text-muted-foreground font-mono text-xs">
							{row.original.code}
						</p>
					)}
				</div>
			),
		}),
		column.accessor("departments", {
			id: "department",
			header: "Dipartimento",
			enableSorting: false,
			filterFn: "facet",
			getUniqueValues: row => row.departments,
			meta: {
				label: "Dipartimento",
				hideBelow: "md",
				facet: { options: departments, icon: LibraryIcon },
			},
			cell: ({ row }) => row.original.departments.join(", ") || "—",
		}),
		column.accessor("courseCodes", {
			id: "course",
			header: "Corsi",
			enableSorting: false,
			filterFn: "facet",
			getUniqueValues: row => row.courseCodes,
			meta: {
				label: "Corsi",
				align: "right",
				hideBelow: "lg",
				facet: { options: courses, icon: DiplomaIcon },
			},
			cell: ({ row }) => row.original.courses,
		}),
		column.accessor("cfu", {
			header: "CFU",
			meta: { label: "CFU", align: "right", hideBelow: "lg" },
			cell: ({ row }) => row.original.cfu ?? "—",
		}),
		column.accessor(row => (row.studiable ? "yes" : "no"), {
			id: "studiable",
			header: "Offerta",
			filterFn: "facet",
			meta: {
				label: "Offerta",
				hideBelow: "sm",
				facet: { options: STUDIABLE_OPTIONS, icon: BookIcon },
			},
			cell: ({ row }) => (
				<span className={row.original.studiable ? undefined : "text-muted-foreground"}>
					{row.original.studiable ? "Studiabile" : "Non studiabile"}
				</span>
			),
		}),
		column.accessor(sheetOf, {
			id: "sheet",
			header: "Scheda",
			filterFn: "facet",
			meta: {
				label: "Scheda",
				align: "right",
				facet: { options: sheets, icon: DocumentTextIcon },
			},
			cell: ({ row }) =>
				row.original.syllabusYear === null ? (
					<span className="text-muted-foreground">Nessuna</span>
				) : (
					<span className="tabular-nums">
						{formatAcademicYear(row.original.syllabusYear)}
					</span>
				),
		}),
	];
}

function ClassesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: classes } = useSuspenseQuery(catalogQueries.classes());
	const { data: courses } = useSuspenseQuery(catalogQueries.courses());

	const stats = useMemo(() => {
		const studiable = classes.filter(row => row.studiable);
		const byYear = new Map<number, number>();
		for (const row of classes) {
			if (row.syllabusYear !== null)
				byYear.set(row.syllabusYear, (byYear.get(row.syllabusYear) ?? 0) + 1);
		}
		return {
			studiable: studiable.length,
			covered: studiable.filter(row => row.syllabusYear !== null).length,
			byYear: [...byYear].sort(([a], [b]) => a - b),
		};
	}, [classes]);

	const columns = useMemo(() => {
		const departments = [...new Set(classes.flatMap(row => row.departments))]
			.sort()
			.map(code => ({ value: code, label: code }));
		const sheets = [
			...stats.byYear.map(([year]) => ({
				value: String(year),
				label: formatAcademicYear(year),
			})),
			{ value: NO_SHEET, label: "Nessuna scheda" },
		];
		const courseOptions = courses.map(course => ({
			value: course.code,
			label: `${course.name} (${course.code})`,
		}));
		return buildColumns(departments, courseOptions, sheets);
	}, [classes, courses, stats.byYear]);

	const table = useDataTable({
		data: classes,
		columns,
		getRowId: row => row.id,
		resizableColumns: true,
		searchFn: (row, query) =>
			row.name.toLowerCase().includes(query) ||
			(row.code?.toLowerCase().includes(query) ?? false),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	const openDetail = (detail: string | undefined) =>
		navigate({ search: prev => ({ ...prev, detail }), resetScroll: false });

	const missing = stats.studiable - stats.covered;
	const peak = Math.max(...stats.byYear.map(([, count]) => count), 1);

	return (
		<ConsolePage
			title="Insegnamenti"
			description="Gli insegnamenti nello staging, con i corsi in cui compaiono e la scheda insegnamento ufficiale."
		>
			<div className="grid gap-4 sm:grid-cols-3">
				<FigureCard
					label="Insegnamenti"
					value={formatNumber(classes.length)}
					hint={`${formatNumber(stats.studiable)} studiabili nell'offerta corrente`}
				/>
				<FigureCard
					label="Con la scheda"
					value={formatPercent(
						stats.studiable > 0 ? stats.covered / stats.studiable : null
					)}
					hint={`${formatNumber(stats.covered)} degli insegnamenti studiabili`}
				/>
				<FigureCard
					label="Senza scheda"
					value={formatNumber(missing)}
					hint="studiabili, senza una scheda in nessun anno"
				/>
			</div>

			<InsetCard
				title="Anno della scheda"
				description="Ogni scheda viene dall'offerta più recente che la pubblica."
			>
				<ul className="space-y-2 p-4">
					{stats.byYear.map(([year, count]) => (
						<li
							key={year}
							className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm"
						>
							<span className="text-muted-foreground tabular-nums">
								{formatAcademicYear(year)}
							</span>
							<span className="bg-muted h-2 overflow-hidden rounded-full">
								<span
									className="bg-primary block h-full rounded-full"
									style={{ width: `${Math.round((count / peak) * 100)}%` }}
								/>
							</span>
							<span className="text-right tabular-nums">{formatNumber(count)}</span>
						</li>
					))}
				</ul>
			</InsetCard>

			<DataTable
				table={table}
				density="compact"
				toolbar={
					<DataTableToolbar
						table={table}
						filterVariant="inline"
						searchPlaceholder="Cerca insegnamenti…"
					/>
				}
				empty={<InlineEmpty>Nessun insegnamento trovato.</InlineEmpty>}
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

			<ClassSheet id={search.detail} onClose={() => openDetail(undefined)} />
		</ConsolePage>
	);
}
