import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { BulkImportForm } from "@/components/admin/forms/bulk-import-form"
import { QuestionForm } from "@/components/admin/forms/question-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useCreateQuestion,
  useCreateQuestionsBulk,
  useUpdateQuestion,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/questions/$questionId")({
  loader: ({ context, params }) => {
    if (params.questionId !== "new") {
      return context.queryClient.ensureQueryData(
        adminQueries.question(params.questionId),
      )
    }
    return null
  },
  component: AdminQuestionPage,
  head: () => ({
    meta: [{ title: "Domanda | Gestione | TriviaMore" }],
  }),
})

function AdminQuestionPage() {
  const { questionId } = Route.useParams()
  const navigate = useNavigate()
  const isNew = questionId === "new"

  // For existing questions, data is already in cache from loader
  const { data: questionData } = useQuery({
    ...adminQueries.question(questionId),
    enabled: !isNew,
  })

  // Extract sectionId from query params for new questions or from existing question
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  )
  const sectionId = isNew
    ? searchParams.get("sectionId") ?? ""
    : questionData?.section_id ?? ""

  const createQuestion = useCreateQuestion(() => {
    if (sectionId) {
      navigate({
        to: "/admin/sections/$sectionId",
        params: { sectionId },
      })
    }
  })

  const createBulk = useCreateQuestionsBulk(() => {
    if (sectionId) {
      navigate({
        to: "/admin/sections/$sectionId",
        params: { sectionId },
      })
    }
  })

  const updateQuestion = useUpdateQuestion()

  const breadcrumb = questionData?.section
    ? `${(questionData.section as { class: { course: { department: { name: string }; name: string }; name: string } }).class.course.department.name} / ${(questionData.section as { class: { course: { name: string } } }).class.course.name} / ${(questionData.section as { class: { name: string } }).class.name} / ${(questionData.section as { name: string }).name}`
    : undefined

  return (
    <div className="py-2">
      <AdminPageHeader
        title={isNew ? "Nuova domanda" : "Modifica domanda"}
        description={breadcrumb}
        backTo={
          sectionId ? "/admin/sections/$sectionId" : "/admin"
        }
        backParams={sectionId ? { sectionId } : undefined}
        backLabel="Sezione"
      />

      {isNew ? (
        <Tabs defaultValue="single">
          <TabsList className="mb-4">
            <TabsTrigger value="single">Singola</TabsTrigger>
            <TabsTrigger value="bulk">Import JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Crea domanda</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionForm
                  sectionId={sectionId}
                  onSubmit={(data) => createQuestion.mutate(data)}
                  isPending={createQuestion.isPending}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Importa domande da JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <BulkImportForm
                  sectionId={sectionId}
                  onSubmit={(questions) => createBulk.mutate(questions)}
                  isPending={createBulk.isPending}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Modifica domanda</CardTitle>
          </CardHeader>
          <CardContent>
            {questionData && (
              <QuestionForm
                question={questionData}
                sectionId={questionData.section_id}
                onSubmit={(data) =>
                  updateQuestion.mutate({ id: questionId, ...data })
                }
                isPending={updateQuestion.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
