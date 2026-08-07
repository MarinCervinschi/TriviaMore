import { useMemo, useState } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { BrowsePublicButton } from "@/components/admin/browse-public-button";
import { ClassForm } from "@/components/admin/forms/class-form";
import { CourseForm } from "@/components/admin/forms/course-form";
import {
	DataTable,
	DataTableEmpty,
	DataTableToolbar,
	createDataTableColumns,
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
import { useAuth } from "@/hooks/useAuth";
import { addClassToCourseFn, createClassFn } from "@/lib/admin/api";
import { useDeleteClass, useUpdateCourse } from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { AdminCourseDetail } from "@/lib/admin/types";
import { seoHead } from "@/lib/seo";

type ClassRow = AdminCourseDetail["classes"][number];

export const Route = createFileRoute("/_app/admin/courses/$courseId")({
	validateSearch: z.object(dataTableSearchFields),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(adminQueries.course(params.courseId)),
	component: AdminCourseDetailPage,
	head: () => seoHead({ title: "Dettaglio Corso | Gestione", noindex: true }),
});

const column = createDataTableColumns<ClassRow>();

function buildColumns(canManage: boolean, onDelete: (id: string) => void) {
	return [
		column.accessor("name", {
			header: "Nome",
			meta: { label: "Nome" },
			cell: ({ row }) => (
				<Link
					to="/admin/classes/$classId"
					params={{ classId: row.original.id }}
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
		column.accessor("classYear", {
			header: "Anno",
			meta: { label: "Anno", align: "center" },
		}),
		// Already excludes the exam-simulation sentinel, and the private sections a
		// maintainer cannot manage.
		column.accessor("sectionCount", {
			header: "Sezioni",
			meta: { label: "Sezioni", align: "center" },
		}),
		...(canManage
			? [
					column.display({
						id: "actions",
						header: "Azioni",
						enableHiding: false,
						meta: { label: "Azioni", align: "right" as const },
						cell: ({ row }) => (
							<AdminRowActions onDelete={() => onDelete(row.original.id)}>
								<Link
									to="/admin/classes/$classId"
									params={{ classId: row.original.id }}
								>
									<Pencil className="h-4 w-4" />
								</Link>
							</AdminRowActions>
						),
					}),
				]
			: []),
	];
}

function AdminCourseDetailPage() {
	const { courseId } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(adminQueries.course(courseId));
	const { user } = useAuth();
	const isMaintainer = user?.role === "MAINTAINER";
	const [createClassOpen, setCreateClassOpen] = useState(false);
	const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
	const [createPending, setCreatePending] = useState(false);

	const queryClient = useQueryClient();
	const updateCourse = useUpdateCourse();
	const deleteClass = useDeleteClass(() => setDeleteClassId(null));

	const { classes, department, ...course } = data;

	const columns = useMemo(
		() => buildColumns(!isMaintainer, setDeleteClassId),
		[isMaintainer]
	);

	const table = useDataTable({
		data: classes,
		columns,
		getRowId: row => row.id,
		searchFn: (cls, query) =>
			cls.name.toLowerCase().includes(query) || cls.code.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div className="py-2">
			<AdminPageHeader
				title={course.name}
				description={`${department.name} / ${course.code}`}
				backTo={isMaintainer ? "/admin" : "/admin/departments/$departmentId"}
				backParams={isMaintainer ? undefined : { departmentId: department.id }}
				backLabel={isMaintainer ? "Dashboard" : department.name}
				actions={
					<BrowsePublicButton
						to="/browse/$department/$course"
						params={{
							department: department.code.toLowerCase(),
							course: course.code.toLowerCase(),
						}}
					/>
				}
			/>

			<div className="grid gap-6">
				{!isMaintainer && (
					<Card className="rounded-2xl">
						<CardHeader className="pb-4">
							<CardTitle>Modifica corso</CardTitle>
						</CardHeader>
						<CardContent>
							<CourseForm
								course={course}
								departmentId={department.id}
								onSubmit={formData =>
									updateCourse.mutate({ id: course.id, ...formData })
								}
								isPending={updateCourse.isPending}
							/>
						</CardContent>
					</Card>
				)}

				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle>Insegnamenti ({classes.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							table={table}
							density="compact"
							bordered={false}
							toolbar={
								<DataTableToolbar
									table={table}
									searchPlaceholder="Cerca insegnamenti..."
									actions={
										!isMaintainer && (
											<Button
												size="sm"
												className="rounded-xl"
												onClick={() => setCreateClassOpen(true)}
											>
												<Plus className="mr-1 h-4 w-4" />
												Nuova
											</Button>
										)
									}
								/>
							}
							empty={
								<DataTableEmpty>
									{search.q
										? "Nessun insegnamento trovato."
										: "Nessun insegnamento in questo corso."}
								</DataTableEmpty>
							}
						/>
					</CardContent>
				</Card>
			</div>

			<Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nuovo insegnamento</DialogTitle>
					</DialogHeader>
					<ClassForm
						junction={{ code: "", class_year: 1, mandatory: false, curriculum: "" }}
						onSubmit={async formData => {
							setCreatePending(true);
							try {
								const cls = await createClassFn({ data: formData });
								await addClassToCourseFn({
									data: {
										course_id: course.id,
										class_id: cls.id,
										code: formData.code || cls.name.substring(0, 10).toUpperCase(),
										class_year: formData.class_year ?? 1,
										mandatory: formData.mandatory ?? false,
										curriculum: formData.curriculum || "",
									},
								});
								toast.success("Insegnamento creato e collegato al corso");
								queryClient.invalidateQueries({ queryKey: ["admin", "course"] });
								queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
								queryClient.invalidateQueries({ queryKey: ["browse"] });
								setCreateClassOpen(false);
							} catch (e: any) {
								toast.error(e.message ?? "Errore nella creazione");
							} finally {
								setCreatePending(false);
							}
						}}
						isPending={createPending}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmationDialog
				open={!!deleteClassId}
				onOpenChange={open => !open && setDeleteClassId(null)}
				title="Elimina insegnamento"
				description="Sei sicuro di voler eliminare questo insegnamento? L'operazione è irreversibile."
				confirmText="Elimina"
				variant="destructive"
				onConfirm={() => {
					if (deleteClassId) deleteClass.mutate({ id: deleteClassId });
				}}
			/>
		</div>
	);
}
