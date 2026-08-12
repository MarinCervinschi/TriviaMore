import { useMemo, useState } from "react";

import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { EyeIcon } from "@solar-icons/react/linear/eye";
import { EyeClosedIcon } from "@solar-icons/react/linear/eye-closed";
import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { BrowsePublicButton } from "@/components/admin/browse-public-button";
import { ClassForm } from "@/components/admin/forms/class-form";
import { SectionForm } from "@/components/admin/forms/section-form";
import {
	DataTable,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import { PlusGlyph } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { InlineEmpty } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/useAuth";
import {
	useCreateExamSimulationSentinel,
	useCreateSection,
	useDeleteSection,
	useUpdateClass,
	useUpdateCourseClass,
} from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { AdminClassDetail } from "@/lib/admin/types";
import { seoHead } from "@/lib/seo";

type SectionRow = AdminClassDetail["sections"][number];

export const Route = createFileRoute("/_app/admin/classes/$classId")({
	validateSearch: z.object({
		...dataTableSearchFields,
		visibility: dataTableFilterField,
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(adminQueries.class(params.classId)),
	component: AdminClassDetailPage,
	head: () => seoHead({ title: "Dettaglio insegnamento | Gestione", noindex: true }),
});

const column = createDataTableColumns<SectionRow>();

function buildColumns(onDelete: (id: string) => void) {
	return [
		column.accessor("name", {
			header: "Nome",
			meta: { label: "Nome" },
			cell: ({ row }) => (
				<Link
					to="/admin/sections/$sectionId"
					params={{ sectionId: row.original.id }}
					className="font-medium hover:underline"
				>
					{row.original.name}
				</Link>
			),
		}),
		column.accessor(section => (section.isPublic ? "public" : "private"), {
			id: "visibility",
			header: "Visibilità",
			filterFn: "arrHas",
			meta: {
				label: "Visibilità",
				align: "center",
				facet: {
					options: [
						{ value: "public", label: "Pubblica", icon: EyeIcon },
						{ value: "private", label: "Privata", icon: EyeClosedIcon },
					],
				},
			},
			cell: ({ row }) =>
				row.original.isPublic ? (
					<Badge variant="default" className="gap-1">
						<EyeIcon className="h-3 w-3" />
						Pubblica
					</Badge>
				) : (
					<Badge variant="secondary" className="gap-1">
						<EyeClosedIcon className="h-3 w-3" />
						Privata
					</Badge>
				),
		}),
		column.accessor("questionCount", {
			header: "Domande",
			meta: { label: "Domande", align: "center" },
		}),
		column.display({
			id: "actions",
			header: "Azioni",
			enableHiding: false,
			meta: { label: "Azioni", align: "right" },
			cell: ({ row }) => (
				<AdminRowActions
					onDelete={() => onDelete(row.original.id)}
					label={row.original.name}
				>
					<Link to="/admin/sections/$sectionId" params={{ sectionId: row.original.id }}>
						<Pen2Icon className="h-4 w-4" />
					</Link>
				</AdminRowActions>
			),
		}),
	];
}

function AdminClassDetailPage() {
	const { classId } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(adminQueries.class(classId));
	const { user } = useAuth();
	const isMaintainer = user?.role === "MAINTAINER";
	const [createSectionOpen, setCreateSectionOpen] = useState(false);
	const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

	const updateClass = useUpdateClass();
	const updateCourseClass = useUpdateCourseClass();
	const createSection = useCreateSection(() => setCreateSectionOpen(false));
	const deleteSection = useDeleteSection(() => setDeleteSectionId(null));
	const createExamSimulation = useCreateExamSimulationSentinel();

	const { sections, courseClass, course, hasExamSimulation, ...cls } = data;

	const columns = useMemo(() => buildColumns(setDeleteSectionId), []);

	const table = useDataTable({
		data: sections,
		columns,
		getRowId: row => row.id,
		searchFn: (section, query) => section.name.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div className="py-2">
			<AdminPageHeader
				title={cls.name}
				description={course ? `${course.department.name} / ${course.name}` : undefined}
				backTo={course ? "/admin/courses/$courseId" : "/admin"}
				backParams={course ? { courseId: course.id } : undefined}
				backLabel={course?.name ?? "Admin"}
				actions={
					course && courseClass ? (
						<BrowsePublicButton
							to="/browse/$department/$course/$class"
							params={{
								department: course.department.code.toLowerCase(),
								course: course.code.toLowerCase(),
								class: courseClass.code.toLowerCase(),
							}}
						/>
					) : undefined
				}
			/>

			<div className="grid gap-6">
				{!isMaintainer && (
					<Card>
						<CardHeader className="pb-4">
							<CardTitle>Modifica insegnamento</CardTitle>
						</CardHeader>
						<CardContent>
							<ClassForm
								cls={cls}
								junction={
									courseClass
										? {
												code: courseClass.code,
												class_year: courseClass.classYear,
												mandatory: courseClass.mandatory,
												curriculum: courseClass.curriculum ?? "",
											}
										: undefined
								}
								onSubmit={formData => {
									const { code, class_year, mandatory, curriculum, ...classFields } =
										formData;
									updateClass.mutate({ id: cls.id, ...classFields });
									if (courseClass && course) {
										updateCourseClass.mutate({
											course_id: course.id,
											class_id: cls.id,
											code,
											class_year,
											mandatory,
											curriculum,
										});
									}
								}}
								isPending={updateClass.isPending || updateCourseClass.isPending}
							/>
						</CardContent>
					</Card>
				)}

				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Sezioni ({sections.length})</h2>
					<DataTable
						table={table}
						density="compact"
						toolbar={
							<DataTableToolbar
								table={table}
								searchPlaceholder="Cerca sezioni..."
								actions={
									<>
										{!isMaintainer && !hasExamSimulation && (
											<Button
												size="sm"
												variant="outline"
												onClick={() => createExamSimulation.mutate({ id: cls.id })}
											>
												<DiplomaIcon className="mr-1 h-4 w-4" />
												Crea Exam Simulation
											</Button>
										)}
										<Button size="sm" onClick={() => setCreateSectionOpen(true)}>
											<PlusGlyph className="mr-1 h-4 w-4" />
											Nuova
										</Button>
									</>
								}
							/>
						}
						empty={
							<InlineEmpty>
								{search.q
									? "Nessuna sezione trovata."
									: "Nessuna sezione in questo insegnamento."}
							</InlineEmpty>
						}
					/>
				</section>
			</div>

			<Dialog open={createSectionOpen} onOpenChange={setCreateSectionOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nuova sezione</DialogTitle>
					</DialogHeader>
					<SectionForm
						classId={cls.id}
						onSubmit={formData => createSection.mutate(formData)}
						isPending={createSection.isPending}
						canEditVisibility={!isMaintainer}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmationDialog
				open={!!deleteSectionId}
				onOpenChange={open => !open && setDeleteSectionId(null)}
				title="Eliminare la sezione?"
				description="La sezione e tutte le sue domande verranno rimosse in modo permanente."
				confirmText="Elimina"
				variant="destructive"
				onConfirm={() => {
					if (deleteSectionId) deleteSection.mutate({ id: deleteSectionId });
				}}
			/>
		</div>
	);
}
