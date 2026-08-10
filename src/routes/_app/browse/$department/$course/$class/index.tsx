import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { BookIcon } from "@solar-icons/react/linear/book";
import { ChatRoundDotsIcon } from "@solar-icons/react/linear/chat-round-dots";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { HeartIcon } from "@solar-icons/react/linear/heart";
import { LockKeyholeIcon } from "@solar-icons/react/linear/lock-keyhole";
import { Login3Icon } from "@solar-icons/react/linear/login-3";
import { SquareArrowRightUpIcon } from "@solar-icons/react/linear/square-arrow-right-up";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { BrowseAdminButton } from "@/components/admin/browse-admin-button";
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb";
import {
	BrowseContributeState,
	BrowseEmptyState,
} from "@/components/browse/browse-empty-state";
import { BrowsePageHeader } from "@/components/browse/browse-page-header";
import { SearchFilter } from "@/components/browse/search-filter";
import {
	DataTable,
	createDataTableColumns,
	dataTableFilterField,
	useDataTable,
} from "@/components/data-table";
import { NotFoundPage } from "@/components/error/not-found-page";
import { RequestFormDialog } from "@/components/requests/request-form-dialog";
import { ClassDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedSearchParam } from "@/hooks/useDebouncedSearchParam";
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants";
import { browseQueries } from "@/lib/browse/queries";
import type { ClassWithSections } from "@/lib/browse/types";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { quizQueries } from "@/lib/quiz/queries";
import { seoHead } from "@/lib/seo";
import { updateRecentClassFn } from "@/lib/user/api";
import { useAddClass, useRemoveClass } from "@/lib/user/mutations";
import { userQueries } from "@/lib/user/queries";
import { cn } from "@/lib/utils";

const StartExamDialog = lazy(() =>
	import("@/components/exam/start-exam-dialog").then(m => ({
		default: m.StartExamDialog,
	}))
);

export const Route = createFileRoute("/_app/browse/$department/$course/$class/")({
	validateSearch: z.object({
		q: dataTableFilterField,
		page: z.coerce.number().int().min(1).optional().catch(undefined),
		sort: dataTableFilterField,
		dir: z.enum(["asc", "desc"]).optional().catch(undefined),
	}),
	loader: async ({ context, params }) => {
		void context.queryClient.prefetchQuery(quizQueries.evaluationModes());

		const data = await context.queryClient.ensureQueryData(
			browseQueries.class(params.department, params.course, params.class)
		);
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, match }) => ({
		...seoHead({
			title: loaderData?.name ?? "Insegnamento",
			description:
				loaderData?.description ??
				`Sezioni, quiz e flashcard per l'esame di ${loaderData?.name ?? "questo insegnamento"} a UniMore. Catalogo curato dalla community con modalità studio e simulazione esame.`,
			path: match.pathname,
			jsonLd: breadcrumbJsonLd([
				{ name: "Esplora", path: "/browse" },
				{
					name: loaderData?.course?.department?.name ?? "Dipartimento",
					path: `/browse/${match.params.department}`,
				},
				{
					name: loaderData?.course?.name ?? "Corso",
					path: `/browse/${match.params.department}/${match.params.course}`,
				},
				{ name: loaderData?.name ?? "Insegnamento", path: match.pathname },
			]),
		}),
	}),
	pendingComponent: ClassDetailSkeleton,
	component: ClassPage,
	notFoundComponent: () => (
		<NotFoundPage message="L'insegnamento che stai cercando non esiste." />
	),
});

type SectionRow = ClassWithSections["sections"][number];

const column = createDataTableColumns<SectionRow>();

// The slug is generated from the name, which is NOT NULL, so it is only
// nullable as far as the column definition is concerned.
const sectionParams = (
	deptCode: string,
	courseCode: string,
	classCode: string,
	section: SectionRow
) => ({
	department: deptCode.toLowerCase(),
	course: courseCode.toLowerCase(),
	class: classCode.toLowerCase(),
	section: section.slug ?? "",
});

function buildColumns(deptCode: string, courseCode: string, classCode: string) {
	return [
		column.accessor("name", {
			header: "Sezione",
			meta: { label: "Sezione", headerClassName: "w-[40%]" },
			cell: ({ row }) => (
				<Link
					to="/browse/$department/$course/$class/$section"
					params={sectionParams(deptCode, courseCode, classCode, row.original)}
					className="block"
				>
					<span className="text-foreground group-hover:text-primary flex items-center gap-2 font-medium transition-colors">
						{!row.original.isPublic && (
							<LockKeyholeIcon className="text-muted-foreground h-3.5 w-3.5" />
						)}
						{row.original.name}
					</span>
				</Link>
			),
		}),
		column.accessor("quizQuestionCount", {
			header: "Quiz",
			meta: { label: "Quiz", align: "center" },
			cell: ({ row }) =>
				row.original.quizQuestionCount > 0 ? (
					<Badge className="gap-1.5 border-blue-500/20 bg-blue-500/10 text-xs text-blue-600">
						<BookIcon className="h-3 w-3" />
						{row.original.quizQuestionCount}
					</Badge>
				) : (
					<span className="text-muted-foreground/50 text-xs">—</span>
				),
		}),
		column.accessor("flashcardQuestionCount", {
			header: "Flashcard",
			meta: { label: "Flashcard", align: "center" },
			cell: ({ row }) =>
				row.original.flashcardQuestionCount > 0 ? (
					<Badge className="gap-1.5 border-purple-500/20 bg-purple-500/10 text-xs text-purple-600">
						<StarsIcon className="h-3 w-3" />
						{row.original.flashcardQuestionCount}
					</Badge>
				) : (
					<span className="text-muted-foreground/50 text-xs">—</span>
				),
		}),
		column.accessor("questionCount", {
			header: "Totale",
			meta: {
				label: "Totale",
				align: "center",
				cellClassName: "text-muted-foreground text-sm",
			},
		}),
	];
}

function ClassPage() {
	const {
		department: deptCode,
		course: courseCode,
		class: classCode,
	} = Route.useParams();
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();
	const { data: classData } = useSuspenseQuery(
		browseQueries.class(deptCode, courseCode, classCode)
	);

	const [searchInput, setSearchInput] = useDebouncedSearchParam(search.q, next =>
		navigate({ search: prev => ({ ...prev, q: next, page: undefined }) })
	);
	const queryClient = useQueryClient();

	const { isAuthenticated } = useAuth();
	const addClass = useAddClass();
	const removeClass = useRemoveClass();

	const { data: isSaved } = useQuery({
		...userQueries.isClassSaved(classData?.id ?? ""),
		enabled: isAuthenticated && !!classData,
	});

	useEffect(() => {
		if (isAuthenticated && classData?.id && classData?.course?.id) {
			updateRecentClassFn({
				data: { classId: classData.id, courseId: classData.course.id },
			}).then(() => {
				queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
			});
		}
	}, [isAuthenticated, classData?.id, classData?.course?.id, queryClient]);

	const columns = useMemo(
		() => buildColumns(deptCode, courseCode, classCode),
		[deptCode, courseCode, classCode]
	);

	const table = useDataTable({
		data: classData?.sections ?? [],
		columns,
		getRowId: row => row.id,
		searchFn: (section, query) => section.name.toLowerCase().includes(query),
		urlState: {
			values: search,
			onChange: patch => navigate({ search: prev => ({ ...prev, ...patch }) }),
		},
	});

	if (!classData) return null;

	const totalQuestions = classData.sections.reduce(
		(sum, s) => sum + s.questionCount,
		0
	);

	const handleToggleSave = () => {
		if (isSaved) {
			removeClass.mutate(classData.id);
		} else {
			addClass.mutate({ classId: classData.id, courseId: classData.course.id });
		}
	};

	return (
		<div className="pb-8">
			<BrowsePageHeader
				breadcrumb={
					<BrowseBreadcrumb
						segments={[
							{ label: "Esplora", href: "/browse" },
							{
								label: classData.course.department.name,
								href: `/browse/${deptCode}`,
							},
							{
								label: classData.course.name,
								href: `/browse/${deptCode}/${courseCode}`,
							},
						]}
						current={classData.name}
					/>
				}
				icon={BookIcon}
				title={classData.name}
				description={classData.description}
				badges={
					<>
						{COURSE_TYPE_CONFIG[classData.course.courseType] && (
							<Badge
								className={cn(
									"text-xs",
									COURSE_TYPE_CONFIG[classData.course.courseType].className
								)}
							>
								{COURSE_TYPE_CONFIG[classData.course.courseType].label}
							</Badge>
						)}
						{classData.courseClass && (
							<Badge variant="outline" className="text-xs">
								{classData.courseClass.mandatory ? "Obbligatorio" : "A scelta"}
							</Badge>
						)}
						{/* Anno, CFU, sede e curriculum sono attributi, non stati: una riga di
						    metadati si legge meglio di una fila di pill tutte uguali. */}
						<span className="text-muted-foreground text-xs">
							{[
								classData.courseClass?.classYear &&
									`Anno ${classData.courseClass.classYear}`,
								classData.cfu && `${classData.cfu} CFU`,
								classData.course.location &&
									(CAMPUS_LOCATION_CONFIG[classData.course.location]?.short ??
										classData.course.location),
								classData.courseClass?.curriculum,
							]
								.filter(Boolean)
								.join(" · ")}
						</span>
						{classData.courseClass?.catalogueUrl && (
							<a
								href={classData.courseClass.catalogueUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs transition-colors"
							>
								<SquareArrowRightUpIcon className="h-3 w-3" />
								Catalogo
							</a>
						)}
					</>
				}
				stats={[
					{
						label: classData.sections.length === 1 ? "sezione" : "sezioni",
						value: classData.sections.length,
					},
					{
						label: totalQuestions === 1 ? "domanda" : "domande",
						value: totalQuestions,
					},
				]}
				actions={
					<>
						<BrowseAdminButton
							to="/admin/classes/$classId"
							params={{ classId: classData.id }}
							courseId={classData.course.id}
						/>
						{isAuthenticated && (
							<>
								<RequestFormDialog
									defaultTargetClassId={classData.id}
									trigger={
										<Button variant="outline" size="sm" className="gap-1.5">
											<ChatRoundDotsIcon className="h-4 w-4" />
											<span className="hidden sm:inline">Proponi contenuto</span>
										</Button>
									}
								/>
								<Button
									variant={isSaved ? "default" : "outline"}
									size="sm"
									onClick={handleToggleSave}
									disabled={addClass.isPending || removeClass.isPending}
								>
									<HeartIcon
										className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
									/>
									{isSaved ? "Salvato" : "Salva"}
								</Button>
							</>
						)}
					</>
				}
			/>
			<div className="container pt-8">
				{classData.examSimulation &&
					(classData.examSimulation.totalQuizQuestions > 0 ||
						classData.examSimulation.totalFlashcardQuestions > 0) && (
						<ExamSimulationSection
							examSimulation={classData.examSimulation}
							isAuthenticated={isAuthenticated}
						/>
					)}
				<SearchFilter
					value={searchInput}
					onChange={setSearchInput}
					placeholder="Cerca sezioni..."
				/>
				{classData.sections.length === 0 ? (
					<BrowseContributeState message="Nessuna sezione disponibile per questo insegnamento.">
						<RequestFormDialog defaultTargetClassId={classData.id} />
					</BrowseContributeState>
				) : (
					<DataTable
						table={table}
						empty={<BrowseEmptyState message="Nessuna sezione trovata." />}
						rowLink={row => (
							<Link
								to="/browse/$department/$course/$class/$section"
								params={sectionParams(deptCode, courseCode, classCode, row)}
								aria-label={`Apri ${row.name}`}
							/>
						)}
					/>
				)}
			</div>
		</div>
	);
}

function ExamSimulationSection({
	examSimulation,
	isAuthenticated,
}: {
	examSimulation: NonNullable<
		import("@/lib/browse/types").ClassWithSections["examSimulation"]
	>;
	isAuthenticated: boolean;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="mb-6">
			<div className="via-card to-card rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 p-4 sm:p-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="inline-flex shrink-0 rounded-xl bg-amber-500/10 p-2.5">
							<DiplomaIcon className="h-5 w-5 text-amber-600" />
						</div>
						<div>
							<h2 className="font-semibold tracking-tight">Simulazione esame</h2>
							<div className="mt-1 flex flex-wrap items-center gap-2">
								{examSimulation.totalQuizQuestions > 0 && (
									<Badge className="gap-1 border-blue-500/20 bg-blue-500/10 text-xs text-blue-600">
										<BookIcon className="h-3 w-3" />
										{examSimulation.totalQuizQuestions} quiz
									</Badge>
								)}
								{examSimulation.totalFlashcardQuestions > 0 && (
									<Badge className="gap-1 border-purple-500/20 bg-purple-500/10 text-xs text-purple-600">
										<StarsIcon className="h-3 w-3" />
										{examSimulation.totalFlashcardQuestions} flashcard
									</Badge>
								)}
							</div>
						</div>
					</div>
					{isAuthenticated ? (
						<Button
							size="sm"
							className="shrink-0 shadow-sm"
							onClick={() => setDialogOpen(true)}
						>
							Simula esame
							<ArrowRightIcon className="ml-2 h-4 w-4" />
						</Button>
					) : (
						<Button size="sm" className="shrink-0 shadow-sm" asChild>
							<Link to="/auth/register">
								<Login3Icon className="mr-2 h-4 w-4" />
								Registrati per iniziare
							</Link>
						</Button>
					)}
				</div>
			</div>
			{dialogOpen && (
				<Suspense>
					<StartExamDialog
						open={dialogOpen}
						onOpenChange={setDialogOpen}
						sectionId={examSimulation.sectionId}
						maxQuizQuestions={examSimulation.totalQuizQuestions}
						maxFlashcardQuestions={examSimulation.totalFlashcardQuestions}
					/>
				</Suspense>
			)}
		</div>
	);
}
