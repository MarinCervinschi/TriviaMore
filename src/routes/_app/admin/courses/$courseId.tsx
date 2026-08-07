import { useState } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { BrowsePublicButton } from "@/components/admin/browse-public-button";
import { ClassForm } from "@/components/admin/forms/class-form";
import { CourseForm } from "@/components/admin/forms/course-form";
import { SortableHeader, useSort } from "@/components/admin/sortable-header";
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
import { Pagination, usePaginatedSearch } from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { addClassToCourseFn, createClassFn } from "@/lib/admin/api";
import { useDeleteClass, useUpdateCourse } from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/admin/courses/$courseId")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(adminQueries.course(params.courseId)),
	component: AdminCourseDetailPage,
	head: () => seoHead({ title: "Dettaglio Corso | Gestione", noindex: true }),
});

function AdminCourseDetailPage() {
	const { courseId } = Route.useParams();
	const { data } = useSuspenseQuery(adminQueries.course(courseId));
	const { user } = useAuth();
	const isMaintainer = user?.role === "MAINTAINER";
	const [createClassOpen, setCreateClassOpen] = useState(false);
	const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	type ClassRow = {
		id: string;
		name: string;
		code: string;
		class_year: number;
		sectionCount: number;
	};

	const { sort, toggleSort } = useSort<ClassRow>();
	const queryClient = useQueryClient();
	const updateCourse = useUpdateCourse();
	const [createPending, setCreatePending] = useState(false);
	const deleteClass = useDeleteClass(() => setDeleteClassId(null));

	const { classes: linkedClasses, department, ...course } = data;

	// sectionCount already excludes the exam-simulation sentinel, and the private
	// sections a maintainer cannot manage.
	const classes = linkedClasses.map(cc => ({
		...cc,
		class_year: cc.classYear,
	})) as ClassRow[];

	const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
		classes,
		(c, q) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
		search,
		page,
		10,
		sort
	);

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
						<div className="flex items-center justify-between gap-4">
							<CardTitle>Insegnamenti ({linkedClasses.length})</CardTitle>
							<div className="flex items-center gap-2">
								<div className="w-56">
									<AdminSearch
										value={search}
										onChange={v => {
											setSearch(v);
											setPage(1);
										}}
										placeholder="Cerca insegnamenti..."
									/>
								</div>
								{!isMaintainer && (
									<Button
										size="sm"
										className="rounded-xl"
										onClick={() => setCreateClassOpen(true)}
									>
										<Plus className="mr-1 h-4 w-4" />
										Nuova
									</Button>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{paged.length === 0 ? (
							<p className="text-muted-foreground py-4 text-center">
								{search
									? "Nessun insegnamento trovato."
									: "Nessun insegnamento in questo corso."}
							</p>
						) : (
							<>
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead>
												<SortableHeader
													label="Nome"
													sortKey="name"
													sort={sort}
													onSort={toggleSort}
												/>
											</TableHead>
											<TableHead>
												<SortableHeader
													label="Codice"
													sortKey="code"
													sort={sort}
													onSort={toggleSort}
												/>
											</TableHead>
											<TableHead className="text-center">
												<SortableHeader
													label="Anno"
													sortKey="class_year"
													sort={sort}
													onSort={toggleSort}
												/>
											</TableHead>
											<TableHead className="text-center">
												<SortableHeader
													label="Sezioni"
													sortKey="sectionCount"
													sort={sort}
													onSort={toggleSort}
												/>
											</TableHead>
											{!isMaintainer && (
												<TableHead className="text-right text-xs font-medium tracking-wider uppercase">
													Azioni
												</TableHead>
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{paged.map(cls => (
											<TableRow
												key={cls.id}
												className="hover:bg-muted/30 transition-colors"
											>
												<TableCell>
													<Link
														to="/admin/classes/$classId"
														params={{ classId: cls.id }}
														className="font-medium hover:underline"
													>
														{cls.name}
													</Link>
												</TableCell>
												<TableCell>
													<Badge variant="secondary" className="rounded-full">
														{cls.code}
													</Badge>
												</TableCell>
												<TableCell className="text-center">{cls.class_year}</TableCell>
												<TableCell className="text-center">
													{cls.sectionCount}
												</TableCell>
												{!isMaintainer && (
													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-1">
															<Button
																variant="ghost"
																size="icon"
																className="rounded-lg"
																asChild
															>
																<Link
																	to="/admin/classes/$classId"
																	params={{ classId: cls.id }}
																>
																	<Pencil className="h-4 w-4" />
																</Link>
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="rounded-lg"
																onClick={() => setDeleteClassId(cls.id)}
															>
																<Trash2 className="text-destructive h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
								<Pagination
									page={safePage}
									totalPages={totalPages}
									onPageChange={setPage}
									totalItems={totalItems}
									pageSize={10}
								/>
							</>
						)}
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
