import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
import { ClassForm } from "@/components/admin/forms/class-form"
import { SectionForm } from "@/components/admin/forms/section-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useCreateSection,
  useDeleteSection,
  useUpdateClass,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/classes/$classId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminQueries.class(params.classId),
    ),
  component: AdminClassDetailPage,
  head: () => seoHead({ title: "Dettaglio Insegnamento | Gestione", noindex: true }),
})

function AdminClassDetailPage() {
  const { classId } = Route.useParams()
  const { data } = useSuspenseQuery(adminQueries.class(classId))
  const [createSectionOpen, setCreateSectionOpen] = useState(false)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  type SectionRow = {
    id: string
    name: string
    is_public: boolean
    questions: { count: number }[]
  }

  const { sort, toggleSort } = useSort<SectionRow>()
  const updateClass = useUpdateClass()
  const createSection = useCreateSection(() => setCreateSectionOpen(false))
  const deleteSection = useDeleteSection(() => setDeleteSectionId(null))

  const { sections, course_classes, ...cls } = data
  const course = course_classes?.[0]?.course

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    sections as SectionRow[],
    (s, q) => s.name.toLowerCase().includes(q),
    search,
    page,
    10,
    sort,
  )

  return (
    <div className="py-2">
      <AdminPageHeader
        title={cls.name}
        description={course ? `${course.department.name} / ${course.name}` : undefined}
        backTo={course ? "/admin/courses/$courseId" : "/admin"}
        backParams={course ? { courseId: course.id } : undefined}
        backLabel={course?.name ?? "Admin"}
      />

      <div className="grid gap-6">
        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle>Modifica insegnamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassForm
              cls={cls}
              onSubmit={(formData) =>
                updateClass.mutate({ id: cls.id, ...formData })
              }
              isPending={updateClass.isPending}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Sezioni ({sections.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-56">
                  <AdminSearch
                    value={search}
                    onChange={(v) => {
                      setSearch(v)
                      setPage(1)
                    }}
                    placeholder="Cerca sezioni..."
                  />
                </div>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setCreateSectionOpen(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Nuova
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paged.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                {search
                  ? "Nessuna sezione trovata."
                  : "Nessuna sezione in questo insegnamento."}
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>
                        <SortableHeader label="Nome" sortKey="name" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="Visibilità" sortKey="is_public" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead className="text-center text-xs font-medium uppercase tracking-wider">Domande</TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((section) => (
                      <TableRow key={section.id} className="transition-colors hover:bg-muted/30">
                        <TableCell>
                          <Link
                            to="/admin/sections/$sectionId"
                            params={{ sectionId: section.id }}
                            className="font-medium hover:underline"
                          >
                            {section.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {section.is_public ? (
                            <Badge variant="default" className="gap-1 rounded-full">
                              <Eye className="h-3 w-3" />
                              Pubblica
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 rounded-full">
                              <EyeOff className="h-3 w-3" />
                              Privata
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {section.questions?.[0]?.count ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="rounded-lg" asChild>
                              <Link
                                to="/admin/sections/$sectionId"
                                params={{ sectionId: section.id }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg"
                              onClick={() =>
                                setDeleteSectionId(section.id)
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

      <Dialog open={createSectionOpen} onOpenChange={setCreateSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova sezione</DialogTitle>
          </DialogHeader>
          <SectionForm
            classId={cls.id}
            onSubmit={(formData) => createSection.mutate(formData)}
            isPending={createSection.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deleteSectionId}
        onOpenChange={(open) => !open && setDeleteSectionId(null)}
        title="Elimina sezione"
        description="Sei sicuro di voler eliminare questa sezione? L'operazione è irreversibile."
        confirmText="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (deleteSectionId)
            deleteSection.mutate({ id: deleteSectionId })
        }}
      />
    </div>
  )
}
