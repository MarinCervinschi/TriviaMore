import { useMemo } from "react";

import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
	DataTable,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import { CloseGlyph } from "@/components/icons";
import { UserClassesSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { UserHero } from "@/components/user/user-hero";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { seoHead } from "@/lib/seo";
import { useRemoveClass } from "@/lib/user/mutations";
import { userQueries } from "@/lib/user/queries";
import type { UserClass } from "@/lib/user/types";
import { formatDate } from "@/lib/utils/format";

export const Route = createFileRoute("/_app/user/classes")({
	validateSearch: z.object({
		...dataTableSearchFields,
		departmentCode: dataTableFilterField,
		courseType: dataTableFilterField,
	}),
	loader: ({ context }) => context.queryClient.ensureQueryData(userQueries.classes()),
	head: () => seoHead({ title: "I miei insegnamenti", noindex: true }),
	pendingComponent: UserClassesSkeleton,
	component: ClassesPage,
});

const column = createDataTableColumns<UserClass>();

function classParams(userClass: UserClass) {
	return {
		department: userClass.departmentCode.toLowerCase(),
		course: userClass.courseCode,
		class: (userClass.classCode ?? "").toLowerCase(),
	};
}

function buildColumns(
	departmentOptions: { value: string; label: string }[],
	courseTypeOptions: { value: string; label: string }[],
	onRemove: (row: { classId: string; courseId: string | null }) => void,
	isRemoving: boolean
) {
	return [
		column.accessor("className", {
			header: "Insegnamento",
			meta: { label: "Insegnamento", cellClassName: "min-w-[16rem]" },
			cell: ({ row }) => (
				<Link
					to="/browse/$department/$course/$class"
					params={classParams(row.original)}
				>
					<span className="text-foreground group-hover:text-brand block font-medium transition-colors">
						{row.original.className}
					</span>
					<p className="text-muted-foreground mt-0.5 text-xs">
						{row.original.courseName} &bull; {row.original.classCode}
					</p>
				</Link>
			),
		}),
		column.accessor("departmentCode", {
			header: "Dipartimento",
			filterFn: "facet",
			meta: {
				label: "Dipartimento",
				align: "center",
				facet: { options: departmentOptions, icon: BuildingsIcon },
			},
			cell: ({ row }) => (
				<Badge variant="outline" className="text-xs">
					{row.original.departmentCode}
				</Badge>
			),
		}),
		column.accessor("courseType", {
			header: "Tipo",
			filterFn: "facet",
			meta: {
				label: "Tipo",
				align: "center",
				facet: { options: courseTypeOptions, icon: BookmarkIcon },
			},
			cell: ({ row }) => (
				<Badge
					className={`text-xs ${COURSE_TYPE_CONFIG[row.original.courseType]?.className ?? ""}`}
				>
					{COURSE_TYPE_CONFIG[row.original.courseType]?.label ??
						row.original.courseType}
				</Badge>
			),
		}),
		column.accessor("classYear", {
			header: "Anno",
			meta: {
				label: "Anno",
				align: "center",
				cellClassName: "text-muted-foreground text-sm",
			},
		}),
		column.accessor("createdAt", {
			header: "Aggiunto",
			meta: {
				label: "Aggiunto",
				align: "center",
				cellClassName: "text-muted-foreground text-xs",
			},
			cell: ({ row }) => formatDate(row.original.createdAt),
		}),
		column.display({
			id: "remove",
			header: "",
			enableHiding: false,
			meta: { label: "Rimuovi", align: "center" },
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="sm"
					onClick={event => {
						event.preventDefault();
						onRemove(row.original);
					}}
					disabled={isRemoving}
					className="text-muted-foreground hover:text-danger h-8 w-8 rounded-lg p-0"
					title="Rimuovi l’insegnamento"
				>
					<CloseGlyph className="h-4 w-4" />
				</Button>
			),
		}),
	];
}

function ClassesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: userClasses } = useSuspenseQuery(userQueries.classes());
	const removeClass = useRemoveClass();

	const departmentOptions = useMemo(
		() =>
			[...new Set(userClasses.map(uc => uc.departmentCode))]
				.sort()
				.map(code => ({ value: code, label: code })),
		[userClasses]
	);

	const courseTypeOptions = useMemo(
		() =>
			[...new Set(userClasses.map(uc => uc.courseType))].sort().map(type => ({
				value: type,
				label: COURSE_TYPE_CONFIG[type]?.label ?? type,
			})),
		[userClasses]
	);

	const columns = useMemo(
		() =>
			buildColumns(
				departmentOptions,
				courseTypeOptions,
				({ classId, courseId }) => removeClass.mutate({ classId, courseId }),
				removeClass.isPending
			),
		[departmentOptions, courseTypeOptions, removeClass]
	);

	const table = useDataTable({
		data: userClasses,
		columns,
		getRowId: row => row.classId,
		initialSorting: [{ id: "className", desc: false }],
		searchFn: (userClass, query) =>
			userClass.className.toLowerCase().includes(query) ||
			userClass.courseName.toLowerCase().includes(query) ||
			userClass.departmentCode.toLowerCase().includes(query) ||
			(userClass.classCode ?? "").toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	const visibleCount = table.getRowCount();

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={DiplomaIcon}
				title="I miei insegnamenti"
				description="Gestisci gli insegnamenti che stai seguendo"
				stats={[
					{ label: "insegnamenti totali", value: userClasses.length },
					{ label: "visualizzati", value: visibleCount },
				]}
			/>

			<div className="container space-y-6">
				<UserBreadcrumb current="I miei insegnamenti" />

				{userClasses.length === 0 ? (
					<EmptyState
						icon={DiplomaIcon}
						title="Nessun insegnamento salvato"
						description="Esplora i dipartimenti e aggiungi gli insegnamenti che ti interessano!"
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				) : (
					<DataTable
						table={table}
						toolbar={
							<DataTableToolbar
								table={table}
								filterVariant="inline"
								searchPlaceholder="Cerca insegnamento, dipartimento..."
							/>
						}
						empty={
							<EmptyState
								icon={DiplomaIcon}
								title="Nessun insegnamento trovato"
								description="Prova a modificare i filtri di ricerca."
								actionLabel="Pulisci filtri"
								onAction={() => table.options.meta?.resetFilters()}
							/>
						}
						rowLink={row => (
							<Link
								to="/browse/$department/$course/$class"
								params={classParams(row)}
								aria-label={`Apri ${row.className}`}
							/>
						)}
					/>
				)}
			</div>
		</div>
	);
}
