import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { BrowsePublicButton } from "@/components/admin/browse-public-button";
import { CourseForm } from "@/components/admin/forms/course-form";
import { DepartmentForm } from "@/components/admin/forms/department-form";
import {
	DataTable,
	DataTableEmpty,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
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
import {
	useCreateCourse,
	useDeleteCourse,
	useUpdateDepartment,
} from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { AdminDepartmentDetail } from "@/lib/admin/types";
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { seoHead } from "@/lib/seo";

type CourseRow = AdminDepartmentDetail["courses"][number];

export const Route = createFileRoute("/_app/admin/departments/$departmentId")({
	validateSearch: z.object({
		...dataTableSearchFields,
		courseType: dataTableFilterField,
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(adminQueries.department(params.departmentId)),
	component: AdminDepartmentDetailPage,
	head: () => seoHead({ title: "Dettaglio Dipartimento | Gestione", noindex: true }),
});

const column = createDataTableColumns<CourseRow>();

const COURSE_TYPE_OPTIONS = Object.entries(COURSE_TYPE_CONFIG).map(
	([value, config]) => ({ value, label: config.label })
);

function buildColumns(onDelete: (id: string) => void) {
	return [
		column.accessor("name", {
			header: "Nome",
			meta: { label: "Nome" },
			cell: ({ row }) => (
				<Link
					to="/admin/courses/$courseId"
					params={{ courseId: row.original.id }}
					className="font-medium hover:underline"
				>
					{row.original.name}
				</Link>
			),
		}),
		column.accessor("code", {
			header: "Codice",
			meta: { label: "Codice" },
			cell: ({ row }) => (
				<Badge variant="secondary" className="rounded-full">
					{row.original.code}
				</Badge>
			),
		}),
		column.accessor("courseType", {
			header: "Tipo",
			filterFn: "arrHas",
			meta: { label: "Tipo", facet: { options: COURSE_TYPE_OPTIONS } },
			cell: ({ row }) => (
				<Badge variant="outline" className="rounded-full">
					{COURSE_TYPE_CONFIG[row.original.courseType]?.label ??
						row.original.courseType}
				</Badge>
			),
		}),
		column.accessor("classCount", {
			header: "Insegnamenti",
			meta: { label: "Insegnamenti", align: "center" },
		}),
		column.display({
			id: "actions",
			header: "Azioni",
			enableHiding: false,
			meta: { label: "Azioni", align: "right" },
			cell: ({ row }) => (
				<AdminRowActions onDelete={() => onDelete(row.original.id)}>
					<Link to="/admin/courses/$courseId" params={{ courseId: row.original.id }}>
						<Pencil className="h-4 w-4" />
					</Link>
				</AdminRowActions>
			),
		}),
	];
}

function AdminDepartmentDetailPage() {
	const { departmentId } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(adminQueries.department(departmentId));
	const [createCourseOpen, setCreateCourseOpen] = useState(false);
	const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

	const updateDepartment = useUpdateDepartment();
	const createCourse = useCreateCourse(() => setCreateCourseOpen(false));
	const deleteCourse = useDeleteCourse(() => setDeleteCourseId(null));

	const { courses, ...department } = data;

	const columns = useMemo(() => buildColumns(setDeleteCourseId), []);

	const table = useDataTable({
		data: courses,
		columns,
		getRowId: row => row.id,
		searchFn: (course, query) =>
			course.name.toLowerCase().includes(query) ||
			course.code.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div className="py-2">
			<AdminPageHeader
				title={department.name}
				description={`Codice: ${department.code}`}
				backTo="/admin/departments"
				backLabel="Dipartimenti"
				actions={
					<BrowsePublicButton
						to="/browse/$department"
						params={{ department: department.code.toLowerCase() }}
					/>
				}
			/>

			<div className="grid gap-6">
				<Card className="rounded-2xl">
					<CardHeader className="pb-4">
						<CardTitle>Modifica dipartimento</CardTitle>
					</CardHeader>
					<CardContent>
						<DepartmentForm
							department={department}
							onSubmit={formData =>
								updateDepartment.mutate({ id: department.id, ...formData })
							}
							isPending={updateDepartment.isPending}
						/>
					</CardContent>
				</Card>

				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle>Corsi ({courses.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							table={table}
							density="compact"
							bordered={false}
							toolbar={
								<DataTableToolbar
									table={table}
									searchPlaceholder="Cerca corsi..."
									actions={
										<Button
											size="sm"
											className="rounded-xl"
											onClick={() => setCreateCourseOpen(true)}
										>
											<Plus className="mr-1 h-4 w-4" />
											Nuovo
										</Button>
									}
								/>
							}
							empty={
								<DataTableEmpty>
									{search.q
										? "Nessun corso trovato."
										: "Nessun corso in questo dipartimento."}
								</DataTableEmpty>
							}
						/>
					</CardContent>
				</Card>
			</div>

			<Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nuovo corso</DialogTitle>
					</DialogHeader>
					<CourseForm
						departmentId={department.id}
						onSubmit={formData => createCourse.mutate(formData)}
						isPending={createCourse.isPending}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmationDialog
				open={!!deleteCourseId}
				onOpenChange={open => !open && setDeleteCourseId(null)}
				title="Elimina corso"
				description="Sei sicuro di voler eliminare questo corso? L'operazione è irreversibile."
				confirmText="Elimina"
				variant="destructive"
				onConfirm={() => {
					if (deleteCourseId) deleteCourse.mutate({ id: deleteCourseId });
				}}
			/>
		</div>
	);
}
