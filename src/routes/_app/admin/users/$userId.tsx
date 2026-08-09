import { useState } from "react";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Library, Plus, Trash2, Trophy } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MaintainerInviteDialog } from "@/components/admin/maintainer-invite-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
	useAddCourseMaintainer,
	useAddDepartmentAdmin,
	useAddSectionAccess,
	useRemoveCourseMaintainer,
	useRemoveDepartmentAdmin,
	useRemoveSectionAccess,
	useUpdateUserRole,
} from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import type { UserRole } from "@/lib/admin/types";
import { seoHead } from "@/lib/seo";
import { formatDateLong, formatDateTime } from "@/lib/utils/format";

const ROLE_LABELS: Record<string, string> = {
	SUPERADMIN: "Superadmin",
	ADMIN: "Admin",
	MAINTAINER: "Maintainer",
	STUDENT: "Studente",
};

export const Route = createFileRoute("/_app/admin/users/$userId")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(adminQueries.user(params.userId)),
	component: AdminUserDetailPage,
	head: () => seoHead({ title: "Dettaglio utente | Gestione", noindex: true }),
});

function AdminUserDetailPage() {
	const { userId } = Route.useParams();
	const { data: user } = useSuspenseQuery(adminQueries.user(userId));
	const { user: currentUser } = useAuth();
	const isSuperadmin = currentUser?.role === "SUPERADMIN";

	// Action visibility follows the role hierarchy: a department admin is an
	// ADMIN-level concept, a course maintainer is MAINTAINER-level. Students see
	// neither — the role must be raised first.
	const canManageDepartments = user.role === "ADMIN" || user.role === "SUPERADMIN";
	const canMaintainCourses =
		user.role === "MAINTAINER" || user.role === "ADMIN" || user.role === "SUPERADMIN";

	const [roleConfirm, setRoleConfirm] = useState<UserRole | null>(null);
	const [addDeptId, setAddDeptId] = useState("");
	const [addCourseId, setAddCourseId] = useState("");
	const [addSectionId, setAddSectionId] = useState("");

	const updateRole = useUpdateUserRole(() => setRoleConfirm(null));
	const addDeptAdmin = useAddDepartmentAdmin();
	const removeDeptAdmin = useRemoveDepartmentAdmin();
	const addMaintainer = useAddCourseMaintainer();
	const removeMaintainer = useRemoveCourseMaintainer();
	const addSectionAccess = useAddSectionAccess();
	const removeSectionAccess = useRemoveSectionAccess();

	// Available items for assignment
	const { data: departments } = useQuery(adminQueries.departments());
	const { data: allCourses } = useQuery(adminQueries.allCourses());
	const { data: privateSections } = useQuery(adminQueries.privateSections());

	const availableDepts = (departments ?? []).filter(
		d => !user.managedDepartments.some(md => md.id === d.id)
	);

	const availableCourses = (allCourses ?? []).filter(
		c => !user.maintainedCourses.some(mc => mc.id === c.id)
	);

	const initials = user.name
		? user.name
				.split(" ")
				.map(n => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<div className="py-2">
			<AdminPageHeader
				title={user.name ?? "Utente"}
				description={user.email ?? ""}
				backTo="/admin/users"
				backLabel="Utenti"
			/>

			<div className="grid gap-6">
				{/* Profile + Stats */}
				<div className="grid gap-6 md:grid-cols-2">
					<Card className="rounded-2xl">
						<CardHeader>
							<CardTitle>Profilo</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-4">
								<Avatar className="ring-primary/10 h-20 w-20 ring-4">
									<AvatarImage src={user.image ?? undefined} />
									<AvatarFallback className="text-lg">{initials}</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-lg font-semibold">{user.name ?? "—"}</p>
									<p className="text-muted-foreground text-sm">{user.email}</p>
									<p className="text-muted-foreground mt-1 text-xs">
										Registrato il {formatDateLong(user.createdAt)}
									</p>
								</div>
							</div>

							<div className="mt-6">
								<label className="mb-2 block text-sm font-medium">Ruolo</label>
								{isSuperadmin ? (
									<Select
										value={user.role}
										onValueChange={v => setRoleConfirm(v as UserRole)}
									>
										<SelectTrigger className="rounded-xl">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(["SUPERADMIN", "ADMIN", "MAINTAINER", "STUDENT"] as const).map(
												r => (
													<SelectItem key={r} value={r}>
														{ROLE_LABELS[r]}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								) : (
									<Badge variant="outline" className="rounded-full text-sm">
										{ROLE_LABELS[user.role]}
									</Badge>
								)}
								{user.role === "STUDENT" && (
									<p className="text-muted-foreground mt-2 text-xs">
										Assegna un ruolo (Maintainer o Admin) per gestire corsi e
										dipartimenti.
									</p>
								)}
							</div>

							<div className="mt-4">
								<MaintainerInviteDialog
									userId={userId}
									userName={user.name}
									userEmail={user.email}
									courses={availableCourses}
								/>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-2xl">
						<CardHeader>
							<CardTitle>Statistiche</CardTitle>
						</CardHeader>
						<CardContent>
							<dl className="grid grid-cols-2 gap-4">
								<div>
									<dt className="text-muted-foreground text-sm">Quiz completati</dt>
									<dd className="flex items-center gap-2 text-2xl font-bold">
										<Trophy className="h-5 w-5 text-yellow-500" />
										{user.stats.totalQuizzes}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground text-sm">Punteggio medio</dt>
									<dd className="text-2xl font-bold">
										{user.stats.averageScore != null
											? `${Math.round((user.stats.averageScore / 33) * 100)}%`
											: "—"}
									</dd>
								</div>
								<div className="col-span-2">
									<dt className="text-muted-foreground text-sm">Ultimo quiz</dt>
									<dd className="text-sm">
										{user.stats.lastQuizAt
											? formatDateTime(user.stats.lastQuizAt)
											: "Nessun quiz completato"}
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>
				</div>

				{/* Department Admin assignments — ADMIN+ only */}
				{canManageDepartments && (
					<Card className="rounded-2xl">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Library className="h-5 w-5" />
									Dipartimenti gestiti
								</CardTitle>
								<p className="text-muted-foreground mt-1 text-sm">
									Dipartimenti di cui l'utente è amministratore
								</p>
							</div>
						</CardHeader>
						<CardContent>
							{user.managedDepartments.length > 0 && (
								<div className="mb-4 flex flex-wrap gap-2">
									{user.managedDepartments.map(dept => (
										<Badge
											key={dept.id}
											variant="secondary"
											className="gap-1 rounded-xl pr-1"
										>
											{dept.name} ({dept.code})
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-destructive/20 h-4 w-4"
												onClick={() =>
													removeDeptAdmin.mutate({
														user_id: userId,
														department_id: dept.id,
													})
												}
											>
												<Trash2 className="text-destructive h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							)}
							{availableDepts.length > 0 && (
								<div className="flex items-center gap-2">
									<Select value={addDeptId} onValueChange={setAddDeptId}>
										<SelectTrigger className="w-64 rounded-xl">
											<SelectValue placeholder="Seleziona dipartimento..." />
										</SelectTrigger>
										<SelectContent>
											{availableDepts.map(d => (
												<SelectItem key={d.id} value={d.id}>
													{d.name} ({d.code})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										size="sm"
										disabled={!addDeptId || addDeptAdmin.isPending}
										onClick={() => {
											if (addDeptId) {
												addDeptAdmin.mutate({
													user_id: userId,
													department_id: addDeptId,
												});
												setAddDeptId("");
											}
										}}
									>
										<Plus className="mr-1 h-4 w-4" />
										Aggiungi
									</Button>
								</div>
							)}
							{user.managedDepartments.length === 0 && availableDepts.length === 0 && (
								<p className="text-muted-foreground text-sm">
									Nessun dipartimento disponibile.
								</p>
							)}
						</CardContent>
					</Card>
				)}

				{/* Course Maintainer assignments — MAINTAINER+ only */}
				{canMaintainCourses && (
					<Card className="rounded-2xl">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GraduationCap className="h-5 w-5" />
								Corsi mantenuti
							</CardTitle>
							<p className="text-muted-foreground text-sm">
								Corsi di cui l'utente è maintainer
							</p>
						</CardHeader>
						<CardContent>
							{user.maintainedCourses.length > 0 && (
								<div className="mb-4 flex flex-wrap gap-2">
									{user.maintainedCourses.map(course => (
										<Badge
											key={course.id}
											variant="secondary"
											className="gap-1 rounded-xl pr-1"
										>
											{course.name} ({course.departmentName})
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-destructive/20 h-4 w-4"
												onClick={() =>
													removeMaintainer.mutate({
														user_id: userId,
														course_id: course.id,
													})
												}
											>
												<Trash2 className="text-destructive h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							)}
							{availableCourses.length > 0 && (
								<div className="flex items-center gap-2">
									<Select value={addCourseId} onValueChange={setAddCourseId}>
										<SelectTrigger className="w-64 rounded-xl">
											<SelectValue placeholder="Seleziona corso..." />
										</SelectTrigger>
										<SelectContent>
											{availableCourses.map(c => (
												<SelectItem key={c.id} value={c.id}>
													{c.name} ({c.code})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										size="sm"
										disabled={!addCourseId || addMaintainer.isPending}
										onClick={() => {
											if (addCourseId) {
												addMaintainer.mutate({
													user_id: userId,
													course_id: addCourseId,
												});
												setAddCourseId("");
											}
										}}
									>
										<Plus className="mr-1 h-4 w-4" />
										Aggiungi
									</Button>
								</div>
							)}
							{user.maintainedCourses.length === 0 && availableCourses.length === 0 && (
								<p className="text-muted-foreground text-sm">
									Nessun corso disponibile.
								</p>
							)}
						</CardContent>
					</Card>
				)}

				{/* Section Access */}
				<Card className="rounded-2xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Accessi sezioni private
						</CardTitle>
						<p className="text-muted-foreground text-sm">
							Sezioni private a cui l'utente ha accesso
						</p>
					</CardHeader>
					<CardContent>
						{user.sectionAccesses.length > 0 && (
							<div className="mb-4 flex flex-wrap gap-2">
								{user.sectionAccesses.map(section => (
									<Badge
										key={section.id}
										variant="secondary"
										className="gap-1 rounded-xl pr-1"
									>
										{section.name} ({section.className})
										<Button
											variant="ghost"
											size="icon"
											className="hover:bg-destructive/20 h-4 w-4"
											onClick={() =>
												removeSectionAccess.mutate({
													user_id: userId,
													section_id: section.id,
												})
											}
										>
											<Trash2 className="text-destructive h-3 w-3" />
										</Button>
									</Badge>
								))}
							</div>
						)}
						{(() => {
							const availableSections = (privateSections ?? []).filter(
								s => !user.sectionAccesses.some(sa => sa.id === s.id)
							);
							return availableSections.length > 0 ? (
								<div className="flex items-center gap-2">
									<Select value={addSectionId} onValueChange={setAddSectionId}>
										<SelectTrigger className="w-64 rounded-xl">
											<SelectValue placeholder="Seleziona sezione..." />
										</SelectTrigger>
										<SelectContent>
											{availableSections.map(s => (
												<SelectItem key={s.id} value={s.id}>
													{s.name} ({s.className})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										size="sm"
										disabled={!addSectionId || addSectionAccess.isPending}
										onClick={() => {
											if (addSectionId) {
												addSectionAccess.mutate({
													user_id: userId,
													section_id: addSectionId,
												});
												setAddSectionId("");
											}
										}}
									>
										<Plus className="mr-1 h-4 w-4" />
										Aggiungi
									</Button>
								</div>
							) : user.sectionAccesses.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									Nessuna sezione privata disponibile.
								</p>
							) : null;
						})()}
					</CardContent>
				</Card>
			</div>

			{/* Role change confirmation */}
			<ConfirmationDialog
				open={!!roleConfirm}
				onOpenChange={open => !open && setRoleConfirm(null)}
				title="Cambia ruolo"
				description={`Sei sicuro di voler cambiare il ruolo di ${user.name ?? "questo utente"} a "${roleConfirm ? ROLE_LABELS[roleConfirm] : ""}"?`}
				confirmText="Conferma"
				onConfirm={() => {
					if (roleConfirm) updateRole.mutate({ id: userId, role: roleConfirm });
				}}
			/>
		</div>
	);
}
