import { useMemo, useState } from "react";

import { Pen2Icon } from "@solar-icons/react/linear/pen-2";
import { TrashBinMinimalisticIcon } from "@solar-icons/react/linear/trash-bin-minimalistic";
import { UsersGroupRoundedIcon } from "@solar-icons/react/linear/users-group-rounded";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRowActions } from "@/components/admin/admin-row-actions";
import { BrowsePublicButton } from "@/components/admin/browse-public-button";
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
import { InlineEmpty } from "@/components/ui/empty-state";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
	useAddSectionAccess,
	useDeleteQuestion,
	useRemoveSectionAccess,
	useUpdateSection,
} from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { AdminQuestion } from "@/lib/admin/types";
import { seoHead } from "@/lib/seo";

const DIFFICULTY_LABELS: Record<string, string> = {
	EASY: "Facile",
	MEDIUM: "Media",
	HARD: "Difficile",
};

const TYPE_LABELS: Record<string, string> = {
	MULTIPLE_CHOICE: "Scelta multipla",
	TRUE_FALSE: "Vero/Falso",
	SHORT_ANSWER: "Risposta breve",
};

const toOptions = (labels: Record<string, string>) =>
	Object.entries(labels).map(([value, label]) => ({ value, label }));

export const Route = createFileRoute("/_app/admin/sections/$sectionId")({
	validateSearch: z.object({
		...dataTableSearchFields,
		questionType: dataTableFilterField,
		difficulty: dataTableFilterField,
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(adminQueries.section(params.sectionId)),
	component: AdminSectionDetailPage,
	head: () => seoHead({ title: "Dettaglio sezione | Gestione", noindex: true }),
});

const column = createDataTableColumns<AdminQuestion>();

function buildColumns(onDelete: (id: string) => void) {
	return [
		column.accessor("content", {
			header: "Contenuto",
			meta: {
				label: "Contenuto",
				headerClassName: "w-[50%]",
				cellClassName: "max-w-xs",
			},
			cell: ({ row }) => (
				<Link
					to="/admin/questions/$questionId"
					params={{ questionId: row.original.id }}
					className="line-clamp-2 font-medium hover:underline"
				>
					{row.original.content}
				</Link>
			),
		}),
		column.accessor("questionType", {
			header: "Tipo",
			filterFn: "arrHas",
			meta: { label: "Tipo", facet: { options: toOptions(TYPE_LABELS) } },
			cell: ({ row }) => (
				<Badge variant="outline" className="rounded-full">
					{TYPE_LABELS[row.original.questionType] ?? row.original.questionType}
				</Badge>
			),
		}),
		column.accessor("difficulty", {
			header: "Difficoltà",
			filterFn: "arrHas",
			meta: { label: "Difficoltà", facet: { options: toOptions(DIFFICULTY_LABELS) } },
			cell: ({ row }) => (
				<Badge
					className="rounded-full"
					variant={
						row.original.difficulty === "HARD"
							? "destructive"
							: row.original.difficulty === "MEDIUM"
								? "default"
								: "secondary"
					}
				>
					{DIFFICULTY_LABELS[row.original.difficulty] ?? row.original.difficulty}
				</Badge>
			),
		}),
		column.display({
			id: "actions",
			header: "Azioni",
			enableHiding: false,
			meta: { label: "Azioni", align: "right" },
			cell: ({ row }) => (
				<AdminRowActions onDelete={() => onDelete(row.original.id)}>
					<Link
						to="/admin/questions/$questionId"
						params={{ questionId: row.original.id }}
					>
						<Pen2Icon className="h-4 w-4" />
					</Link>
				</AdminRowActions>
			),
		}),
	];
}

function AdminSectionDetailPage() {
	const { sectionId } = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(adminQueries.section(sectionId));
	const { user } = useAuth();
	const isSuperadmin = user?.role === "SUPERADMIN";
	const isMaintainer = user?.role === "MAINTAINER";
	const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
	const [addUserId, setAddUserId] = useState("");

	const updateSection = useUpdateSection();
	const deleteQuestion = useDeleteQuestion(() => setDeleteQuestionId(null));
	const addAccess = useAddSectionAccess();
	const removeAccess = useRemoveSectionAccess();

	const { questions, parent, ...section } = data;
	const sectionSlug = section.slug;

	// Section access management (only for private sections)
	const { data: accessUsers } = useQuery({
		...adminQueries.sectionAccessUsers(sectionId),
		enabled: !section.isPublic && isSuperadmin,
	});
	const { data: allUsers } = useQuery({
		...adminQueries.users(),
		enabled: !section.isPublic && isSuperadmin,
	});

	const columns = useMemo(() => buildColumns(setDeleteQuestionId), []);

	const table = useDataTable({
		data: questions,
		columns,
		getRowId: row => row.id,
		searchFn: (question, query) => question.content.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	const countByType = (type: string) =>
		questions.filter(question => question.questionType === type).length;

	return (
		<div className="py-2">
			<AdminPageHeader
				title={section.name}
				description={[parent?.departmentName, parent?.courseName, section.className]
					.filter(Boolean)
					.join(" / ")}
				backTo="/admin/classes/$classId"
				backParams={{ classId: section.classId }}
				backLabel={section.className}
				actions={
					parent && sectionSlug ? (
						<BrowsePublicButton
							to="/browse/$department/$course/$class/$section"
							params={{
								department: parent.departmentCode.toLowerCase(),
								course: parent.courseCode.toLowerCase(),
								class: parent.classCode.toLowerCase(),
								section: sectionSlug,
							}}
						/>
					) : undefined
				}
			/>

			<div className="grid gap-6">
				<div className="grid gap-6 md:grid-cols-2">
					<Card className="rounded-2xl">
						<CardHeader className="pb-4">
							<CardTitle>Modifica sezione</CardTitle>
						</CardHeader>
						<CardContent>
							<SectionForm
								section={section}
								classId={section.classId}
								onSubmit={formData =>
									updateSection.mutate({ id: section.id, ...formData })
								}
								isPending={updateSection.isPending}
								canEditVisibility={!isMaintainer}
							/>
						</CardContent>
					</Card>

					<Card className="rounded-2xl">
						<CardHeader>
							<CardTitle>Statistiche</CardTitle>
						</CardHeader>
						<CardContent>
							<dl className="grid grid-cols-2 gap-4">
								<div className="bg-muted/30 rounded-xl p-4">
									<dt className="text-muted-foreground text-sm">Totale domande</dt>
									<dd className="text-2xl font-bold">{questions.length}</dd>
								</div>
								<div className="bg-muted/30 rounded-xl p-4">
									<dt className="text-muted-foreground text-sm">Visibilità</dt>
									<dd className="text-2xl font-bold">
										{section.isPublic ? "Pubblica" : "Privata"}
									</dd>
								</div>
								<div className="bg-muted/30 rounded-xl p-4">
									<dt className="text-muted-foreground text-sm">Scelta multipla</dt>
									<dd className="text-2xl font-bold">
										{countByType("MULTIPLE_CHOICE")}
									</dd>
								</div>
								<div className="bg-muted/30 rounded-xl p-4">
									<dt className="text-muted-foreground text-sm">Vero/Falso</dt>
									<dd className="text-2xl font-bold">{countByType("TRUE_FALSE")}</dd>
								</div>
								<div className="bg-muted/30 rounded-xl p-4">
									<dt className="text-muted-foreground text-sm">Risposta breve</dt>
									<dd className="text-2xl font-bold">{countByType("SHORT_ANSWER")}</dd>
								</div>
							</dl>
						</CardContent>
					</Card>
				</div>

				{/* Section access management (private sections, SUPERADMIN only) */}
				{!section.isPublic && isSuperadmin && (
					<Card className="rounded-2xl">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UsersGroupRoundedIcon className="h-5 w-5" />
								Accessi utente ({accessUsers?.length ?? 0})
							</CardTitle>
							<p className="text-muted-foreground text-sm">
								Utenti con accesso a questa sezione privata
							</p>
						</CardHeader>
						<CardContent>
							{(accessUsers?.length ?? 0) > 0 && (
								<div className="mb-4 flex flex-wrap gap-2">
									{accessUsers?.map(u => (
										<Badge
											key={u.id}
											variant="secondary"
											className="gap-1 rounded-full pr-1"
										>
											{u.name ?? u.email ?? u.id}
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-destructive/20 size-6"
												aria-label={`Revoca l\u2019accesso a ${u.name ?? u.email ?? u.id}`}
												onClick={() =>
													removeAccess.mutate({
														user_id: u.id,
														section_id: sectionId,
													})
												}
											>
												<TrashBinMinimalisticIcon className="text-danger h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							)}
							{(() => {
								const availableUsers = (allUsers ?? []).filter(
									u => !accessUsers?.some(au => au.id === u.id)
								);
								return availableUsers.length > 0 ? (
									<div className="flex items-center gap-2">
										<Select value={addUserId} onValueChange={setAddUserId}>
											<SelectTrigger className="w-64 rounded-xl">
												<SelectValue placeholder="Seleziona utente..." />
											</SelectTrigger>
											<SelectContent>
												{availableUsers.map(u => (
													<SelectItem key={u.id} value={u.id}>
														{u.name ?? "—"} ({u.email})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											size="sm"
											disabled={!addUserId || addAccess.isPending}
											onClick={() => {
												if (addUserId) {
													addAccess.mutate({
														user_id: addUserId,
														section_id: sectionId,
													});
													setAddUserId("");
												}
											}}
										>
											<PlusGlyph className="mr-1 h-4 w-4" />
											Aggiungi
										</Button>
									</div>
								) : null;
							})()}
						</CardContent>
					</Card>
				)}

				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle>Domande ({questions.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							table={table}
							density="compact"
							bordered={false}
							toolbar={
								<DataTableToolbar
									table={table}
									searchPlaceholder="Cerca domande..."
									actions={
										<Button size="sm" asChild>
											<Link
												to="/admin/questions/$questionId"
												params={{ questionId: "new" }}
												search={{ sectionId: section.id } as never}
											>
												Nuova domanda
											</Link>
										</Button>
									}
								/>
							}
							empty={
								<InlineEmpty>
									{search.q
										? "Nessuna domanda trovata."
										: "Nessuna domanda in questa sezione."}
								</InlineEmpty>
							}
						/>
					</CardContent>
				</Card>
			</div>

			<ConfirmationDialog
				open={!!deleteQuestionId}
				onOpenChange={open => !open && setDeleteQuestionId(null)}
				title="Eliminare la domanda?"
				description="La domanda verrà rimossa in modo permanente da questa sezione."
				confirmText="Elimina"
				variant="destructive"
				onConfirm={() => {
					if (deleteQuestionId) deleteQuestion.mutate({ id: deleteQuestionId });
				}}
			/>
		</div>
	);
}
