import { useMemo, useState } from "react";

import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import {
	DataTable,
	DataTableEmpty,
	DataTableToolbar,
	createDataTableColumns,
	dataTableFilterField,
	dataTableSearchFields,
	useDataTable,
} from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useDeleteUser } from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { AdminUser } from "@/lib/admin/types";
import { seoHead } from "@/lib/seo";
import { formatDate } from "@/lib/utils/format";

const ROLE_LABELS: Record<string, string> = {
	SUPERADMIN: "Superadmin",
	ADMIN: "Admin",
	MAINTAINER: "Maintainer",
	STUDENT: "Studente",
};

const ROLE_VARIANTS: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	SUPERADMIN: "destructive",
	ADMIN: "default",
	MAINTAINER: "secondary",
	STUDENT: "outline",
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
	value,
	label,
}));

export const Route = createFileRoute("/_app/admin/users/")({
	validateSearch: z.object({
		...dataTableSearchFields,
		role: dataTableFilterField,
	}),
	loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.users()),
	component: AdminUsersPage,
	head: () => seoHead({ title: "Utenti | Gestione", noindex: true }),
});

const column = createDataTableColumns<AdminUser>();

function initials(name: string | null) {
	if (!name) return "?";
	return name
		.split(" ")
		.map(part => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function buildColumns(onDelete: (id: string) => void) {
	return [
		column.accessor("name", {
			header: "Utente",
			meta: { label: "Utente" },
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar className="ring-background h-8 w-8 ring-2">
						<AvatarImage
							src={row.original.image ?? undefined}
							alt={row.original.name ?? ""}
						/>
						<AvatarFallback className="text-xs">
							{initials(row.original.name)}
						</AvatarFallback>
					</Avatar>
					<div>
						<Link
							to="/admin/users/$userId"
							params={{ userId: row.original.id }}
							className="font-medium hover:underline"
						>
							{row.original.name ?? "—"}
						</Link>
						<p className="text-muted-foreground text-xs">{row.original.email}</p>
					</div>
				</div>
			),
		}),
		column.accessor("role", {
			header: "Ruolo",
			filterFn: "arrHas",
			meta: { label: "Ruolo", facet: { options: ROLE_OPTIONS } },
			cell: ({ row }) => (
				<Badge variant={ROLE_VARIANTS[row.original.role]} className="rounded-full">
					{ROLE_LABELS[row.original.role] ?? row.original.role}
				</Badge>
			),
		}),
		column.accessor("quizAttemptsCount", {
			header: "Quiz",
			meta: { label: "Quiz", align: "center" },
		}),
		column.accessor("createdAt", {
			header: "Registrato",
			meta: { label: "Registrato", cellClassName: "text-muted-foreground text-sm" },
			cell: ({ row }) => formatDate(row.original.createdAt),
		}),
		column.display({
			id: "actions",
			header: "Azioni",
			enableHiding: false,
			meta: { label: "Azioni", align: "right" },
			cell: ({ row }) => (
				<AdminRowActions
					onDelete={() => onDelete(row.original.id)}
					label={row.original.name ?? row.original.email ?? undefined}
				>
					<Link to="/admin/users/$userId" params={{ userId: row.original.id }}>
						<Pen2Icon className="h-4 w-4" />
					</Link>
				</AdminRowActions>
			),
		}),
	];
}

function AdminUsersPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: users } = useSuspenseQuery(adminQueries.users());
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const deleteUser = useDeleteUser(() => setDeleteId(null));

	const columns = useMemo(() => buildColumns(setDeleteId), []);

	const table = useDataTable({
		data: users,
		columns,
		getRowId: row => row.id,
		searchFn: (user, query) =>
			(user.name?.toLowerCase().includes(query) ?? false) ||
			(user.email?.toLowerCase().includes(query) ?? false),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	return (
		<div className="py-2">
			<AdminPageHeader
				title="Utenti"
				description={`${users.length} utenti registrati`}
				backTo="/admin"
				backLabel="Dashboard"
			/>

			<Card className="rounded-2xl">
				<CardHeader>
					<CardTitle>Lista utenti</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable
						table={table}
						density="compact"
						bordered={false}
						toolbar={
							<DataTableToolbar
								table={table}
								searchPlaceholder="Cerca per nome o email..."
							/>
						}
						empty={
							<DataTableEmpty>
								{search.q || search.role
									? "Nessun utente trovato."
									: "Nessun utente registrato."}
							</DataTableEmpty>
						}
					/>
				</CardContent>
			</Card>

			<ConfirmationDialog
				open={!!deleteId}
				onOpenChange={open => !open && setDeleteId(null)}
				title="Elimina utente"
				description="Sei sicuro di voler eliminare questo utente? Tutti i suoi dati (quiz, progressi, segnalibri) verranno eliminati. L'operazione è irreversibile."
				confirmText="Elimina"
				variant="destructive"
				onConfirm={() => {
					if (deleteId) deleteUser.mutate({ id: deleteId });
				}}
			/>
		</div>
	);
}
