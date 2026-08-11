import { useMemo, useState } from "react";

import { LibraryIcon } from "@solar-icons/react/linear/library";
import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { DepartmentForm } from "@/components/admin/forms/department-form";
import {
	DataTable,
	DataTableToolbar,
	createDataTableColumns,
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
import { useCreateDepartment, useDeleteDepartment } from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { AdminDepartment } from "@/lib/admin/types";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/admin/departments/")({
	validateSearch: z.object(dataTableSearchFields),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(adminQueries.departments()),
	component: AdminDepartmentsPage,
	head: () => seoHead({ title: "Dipartimenti | Gestione", noindex: true }),
});

const column = createDataTableColumns<AdminDepartment>();

function buildColumns(onDelete: (id: string) => void) {
	return [
		column.accessor("name", {
			header: "Nome",
			meta: { label: "Nome" },
			cell: ({ row }) => (
				<Link
					to="/admin/departments/$departmentId"
					params={{ departmentId: row.original.id }}
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
		column.accessor("courseCount", {
			header: "Corsi",
			meta: { label: "Corsi", align: "center" },
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
					<Link
						to="/admin/departments/$departmentId"
						params={{ departmentId: row.original.id }}
					>
						<Pen2Icon className="h-4 w-4" />
					</Link>
				</AdminRowActions>
			),
		}),
	];
}

function AdminDepartmentsPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: departments } = useSuspenseQuery(adminQueries.departments());
	const [createOpen, setCreateOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const createDepartment = useCreateDepartment(() => setCreateOpen(false));
	const deleteDepartment = useDeleteDepartment(() => setDeleteId(null));

	const columns = useMemo(() => buildColumns(setDeleteId), []);

	const table = useDataTable({
		data: departments,
		columns,
		getRowId: row => row.id,
		searchFn: (department, query) =>
			department.name.toLowerCase().includes(query) ||
			department.code.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div className="py-2">
			<AdminPageHeader
				title="Dipartimenti"
				description={`${departments.length} dipartimenti totali`}
				icon={LibraryIcon}
				backTo="/admin"
				backLabel="Dashboard"
				actions={
					<Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
						<PlusGlyph className="mr-2 h-4 w-4" />
						Nuovo dipartimento
					</Button>
				}
			/>

			<Card className="rounded-2xl">
				<CardHeader>
					<CardTitle>Lista dipartimenti</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						table={table}
						density="compact"
						bordered={false}
						toolbar={
							<DataTableToolbar
								table={table}
								searchPlaceholder="Cerca dipartimenti..."
							/>
						}
						empty={
							<InlineEmpty>
								{search.q
									? "Nessun dipartimento trovato."
									: "Nessun dipartimento. Crea il primo!"}
							</InlineEmpty>
						}
					/>
				</CardContent>
			</Card>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nuovo dipartimento</DialogTitle>
					</DialogHeader>
					<DepartmentForm
						onSubmit={data => createDepartment.mutate(data)}
						isPending={createDepartment.isPending}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmationDialog
				open={!!deleteId}
				onOpenChange={open => !open && setDeleteId(null)}
				title="Eliminare il dipartimento?"
				description="Il dipartimento e tutti i suoi corsi verranno rimossi in modo permanente."
				confirmText="Elimina"
				variant="destructive"
				onConfirm={() => {
					if (deleteId) deleteDepartment.mutate({ id: deleteId });
				}}
			/>
		</div>
	);
}
