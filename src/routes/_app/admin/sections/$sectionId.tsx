import { useState } from "react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Pencil, Plus, Trash2, Users } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
import { SectionForm } from "@/components/admin/forms/section-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAddSectionAccess,
  useDeleteQuestion,
  useRemoveSectionAccess,
  useUpdateSection,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"
import type { Question } from "@/lib/admin/types"

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Facile",
  MEDIUM: "Media",
  HARD: "Difficile",
}

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Scelta multipla",
  TRUE_FALSE: "Vero/Falso",
  SHORT_ANSWER: "Risposta breve",
}

export const Route = createFileRoute("/_app/admin/sections/$sectionId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminQueries.section(params.sectionId),
    ),
  component: AdminSectionDetailPage,
  head: () => ({
    meta: [{ title: "Dettaglio Sezione | Gestione | TriviaMore" }],
  }),
})

function AdminSectionDetailPage() {
  const { sectionId } = Route.useParams()
  const { data } = useSuspenseQuery(adminQueries.section(sectionId))
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const [addUserId, setAddUserId] = useState("")

  const { sort, toggleSort } = useSort<Question>()
  const updateSection = useUpdateSection()
  const deleteQuestion = useDeleteQuestion(() => setDeleteQuestionId(null))
  const addAccess = useAddSectionAccess()
  const removeAccess = useRemoveSectionAccess()

  const { questions, class: cls, ...section } = data

  // Section access management (only for private sections)
  const { data: accessUsers } = useQuery({
    ...adminQueries.sectionAccessUsers(sectionId),
    enabled: !section.is_public,
  })
  const { data: allUsers } = useQuery({
    ...adminQueries.users(),
    enabled: !section.is_public,
  })

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    questions as Question[],
    (q, query) => q.content.toLowerCase().includes(query),
    search,
    page,
    10,
    sort,
  )

  return (
    <div className="py-2">
      <AdminPageHeader
        title={section.name}
        description={`${cls.course.department.name} / ${cls.course.name} / ${cls.name}`}
        backTo="/admin/classes/$classId"
        backParams={{ classId: cls.id }}
        backLabel={cls.name}
      />

      <div className="grid gap-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Modifica sezione</CardTitle>
            </CardHeader>
            <CardContent>
              <SectionForm
                section={section}
                classId={cls.id}
                onSubmit={(formData) =>
                  updateSection.mutate({ id: section.id, ...formData })
                }
                isPending={updateSection.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiche</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Totale domande
                  </dt>
                  <dd className="text-2xl font-bold">{questions.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Visibilità</dt>
                  <dd className="text-2xl font-bold">
                    {section.is_public ? "Pubblica" : "Privata"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Scelta multipla
                  </dt>
                  <dd className="text-2xl font-bold">
                    {
                      (questions as Question[]).filter(
                        (q) => q.question_type === "MULTIPLE_CHOICE",
                      ).length
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Vero/Falso
                  </dt>
                  <dd className="text-2xl font-bold">
                    {
                      (questions as Question[]).filter(
                        (q) => q.question_type === "TRUE_FALSE",
                      ).length
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Risposta breve
                  </dt>
                  <dd className="text-2xl font-bold">
                    {
                      (questions as Question[]).filter(
                        (q) => q.question_type === "SHORT_ANSWER",
                      ).length
                    }
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Section access management (only for private sections) */}
        {!section.is_public && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Accessi utente ({accessUsers?.length ?? 0})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Utenti con accesso a questa sezione privata
              </p>
            </CardHeader>
            <CardContent>
              {(accessUsers?.length ?? 0) > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {accessUsers?.map((u) => (
                    <Badge
                      key={u.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {u.name ?? u.email ?? u.id}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-destructive/20"
                        onClick={() =>
                          removeAccess.mutate({
                            user_id: u.id,
                            section_id: sectionId,
                          })
                        }
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              {(() => {
                const availableUsers = (allUsers ?? []).filter(
                  (u) => !accessUsers?.some((au) => au.id === u.id),
                )
                return availableUsers.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <Select value={addUserId} onValueChange={setAddUserId}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Seleziona utente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((u) => (
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
                          })
                          setAddUserId("")
                        }
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Aggiungi
                    </Button>
                  </div>
                ) : null
              })()}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Domande ({questions.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-64">
                  <AdminSearch
                    value={search}
                    onChange={(v) => {
                      setSearch(v)
                      setPage(1)
                    }}
                    placeholder="Cerca domande..."
                  />
                </div>
                <Button size="sm" asChild>
                  <Link
                    to="/admin/questions/$questionId"
                    params={{ questionId: "new" }}
                    search={{ sectionId: section.id } as never}
                  >
                    Nuova domanda
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paged.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                {search
                  ? "Nessuna domanda trovata."
                  : "Nessuna domanda in questa sezione."}
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">
                        <SortableHeader label="Contenuto" sortKey="content" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead>
                        <SortableHeader label="Tipo" sortKey="question_type" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead>
                        <SortableHeader label="Difficoltà" sortKey="difficulty" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-xs truncate">
                          <Link
                            to="/admin/questions/$questionId"
                            params={{ questionId: question.id }}
                            className="font-medium hover:underline"
                          >
                            {question.content.length > 80
                              ? `${question.content.slice(0, 80)}...`
                              : question.content}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TYPE_LABELS[question.question_type] ??
                              question.question_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              question.difficulty === "HARD"
                                ? "destructive"
                                : question.difficulty === "MEDIUM"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {DIFFICULTY_LABELS[question.difficulty] ??
                              question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                to="/admin/questions/$questionId"
                                params={{ questionId: question.id }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteQuestionId(question.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <AdminPagination
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

      <ConfirmationDialog
        open={!!deleteQuestionId}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
        title="Elimina domanda"
        description="Sei sicuro di voler eliminare questa domanda? L'operazione è irreversibile."
        confirmText="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (deleteQuestionId)
            deleteQuestion.mutate({ id: deleteQuestionId })
        }}
      />
    </div>
  )
}
