import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BulkImportForm } from "@/components/admin/forms/bulk-import-form";
import { QuestionForm } from "@/components/admin/forms/question-form";
import { InsetCard } from "@/components/ui/inset-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useCreateQuestion,
	useCreateQuestionsBulk,
	useUpdateQuestion,
} from "@/lib/admin/mutations";
import { adminQueries } from "@/lib/admin/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/admin/questions/$questionId")({
	loader: ({ context, params }) => {
		if (params.questionId !== "new") {
			return context.queryClient.ensureQueryData(
				adminQueries.question(params.questionId)
			);
		}
		return null;
	},
	component: AdminQuestionPage,
	head: () => seoHead({ title: "Domanda | Gestione", noindex: true }),
});

function AdminQuestionPage() {
	const { questionId } = Route.useParams();
	const navigate = useNavigate();
	const isNew = questionId === "new";

	// For existing questions, data is already in cache from loader
	const { data: questionData } = useQuery({
		...adminQueries.question(questionId),
		enabled: !isNew,
	});

	// Extract sectionId from query params for new questions or from existing question
	const searchParams = new URLSearchParams(
		typeof window !== "undefined" ? window.location.search : ""
	);
	const sectionId = isNew
		? (searchParams.get("sectionId") ?? "")
		: (questionData?.sectionId ?? "");

	const createQuestion = useCreateQuestion(() => {
		if (sectionId) {
			navigate({
				to: "/admin/sections/$sectionId",
				params: { sectionId },
			});
		}
	});

	const createBulk = useCreateQuestionsBulk(() => {
		if (sectionId) {
			navigate({
				to: "/admin/sections/$sectionId",
				params: { sectionId },
			});
		}
	});

	const updateQuestion = useUpdateQuestion();

	const breadcrumb = questionData
		? [
				questionData.parent?.departmentName,
				questionData.parent?.courseName,
				questionData.className,
				questionData.sectionName,
			]
				.filter(Boolean)
				.join(" / ")
		: undefined;

	return (
		<div className="py-2">
			<AdminPageHeader
				title={isNew ? "Nuova domanda" : "Modifica domanda"}
				description={breadcrumb}
				backTo={sectionId ? "/admin/sections/$sectionId" : "/admin"}
				backParams={sectionId ? { sectionId } : undefined}
				backLabel="Sezione"
			/>

			{isNew ? (
				<Tabs defaultValue="single">
					<TabsList className="bg-muted/50 mb-4 rounded-2xl p-1">
						<TabsTrigger
							value="single"
							className="data-[state=active]:bg-background rounded-xl data-[state=active]:shadow-sm"
						>
							Singola
						</TabsTrigger>
						<TabsTrigger
							value="bulk"
							className="data-[state=active]:bg-background rounded-xl data-[state=active]:shadow-sm"
						>
							Import JSON
						</TabsTrigger>
					</TabsList>
					<TabsContent value="single">
						<InsetCard title="Crea domanda">
							<div className="p-6">
								<QuestionForm
									sectionId={sectionId}
									onSubmit={data => createQuestion.mutate(data)}
									isPending={createQuestion.isPending}
								/>
							</div>
						</InsetCard>
					</TabsContent>
					<TabsContent value="bulk">
						<InsetCard title="Importa domande da JSON">
							<div className="p-6">
								<BulkImportForm
									sectionId={sectionId}
									onSubmit={questions => createBulk.mutate(questions)}
									isPending={createBulk.isPending}
								/>
							</div>
						</InsetCard>
					</TabsContent>
				</Tabs>
			) : (
				<InsetCard title="Modifica domanda">
					<div className="p-6">
						{questionData && (
							<QuestionForm
								question={questionData}
								sectionId={questionData.sectionId}
								onSubmit={data => updateQuestion.mutate({ id: questionId, ...data })}
								isPending={updateQuestion.isPending}
							/>
						)}
					</div>
				</InsetCard>
			)}
		</div>
	);
}
