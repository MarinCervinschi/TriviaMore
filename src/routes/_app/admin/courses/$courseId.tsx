import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
import { ClassForm } from "@/components/admin/forms/class-form"
import { CourseForm } from "@/components/admin/forms/course-form"
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
  useCreateClass,
  useDeleteClass,
  useUpdateCourse,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/courses/$courseId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminQueries.course(params.courseId),
    ),
  component: AdminCourseDetailPage,
  head: () => seoHead({ title: "Dettaglio Corso | Gestione", noindex: true }),
})

function AdminCourseDetailPage() {
  const { courseId } = Route.useParams()
  const { data } = useSuspenseQuery(adminQueries.course(courseId))
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  type ClassRow = {
    id: string
    name: string
    code: string
    class_year: number
    sections: { count: number }[]
  }

  const { sort, toggleSort } = useSort<ClassRow>()
  const updateCourse = useUpdateCourse()
  const createClass = useCreateClass(() => setCreateClassOpen(false))
  const deleteClass = useDeleteClass(() => setDeleteClassId(null))

  const { classes, department, ...course } = data

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    classes as ClassRow[],
    (c, q) =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    search,
    page,
    10,
    sort,
  )

  return (
    <div className="py-2">
      <AdminPageHeader
        title={course.name}
        description={`${department.name} / ${course.code}`}
        backTo="/admin/departments/$departmentId"
        backParams={{ departmentId: department.id }}
        backLabel={department.name}
      />

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Modifica corso</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseForm
              course={course}
              departmentId={department.id}
              onSubmit={(formData) =>
                updateCourse.mutate({ id: course.id, ...formData })
              }
              isPending={updateCourse.isPending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Classi ({classes.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-56">
                  <AdminSearch
                    value={search}
                    onChange={(v) => {
                      setSearch(v)
                      setPage(1)
                    }}
                    placeholder="Cerca classi..."
                  />
                </div>
                <Button size="sm" onClick={() => setCreateClassOpen(true)}>
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
                  ? "Nessuna classe trovata."
                  : "Nessuna classe in questo corso."}
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortableHeader label="Nome" sortKey="name" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead>
                        <SortableHeader label="Codice" sortKey="code" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="Anno" sortKey="class_year" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead className="text-center">Sezioni</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((cls) => (
                      <TableRow key={cls.id}>
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
                          <Badge variant="secondary">{cls.code}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {cls.class_year}
                        </TableCell>
                        <TableCell className="text-center">
                          {cls.sections?.[0]?.count ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
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
                              onClick={() => setDeleteClassId(cls.id)}
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

      <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova classe</DialogTitle>
          </DialogHeader>
          <ClassForm
            courseId={course.id}
            onSubmit={(formData) => createClass.mutate(formData)}
            isPending={createClass.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deleteClassId}
        onOpenChange={(open) => !open && setDeleteClassId(null)}
        title="Elimina classe"
        description="Sei sicuro di voler eliminare questa classe? L'operazione è irreversibile."
        confirmText="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (deleteClassId) deleteClass.mutate({ id: deleteClassId })
        }}
      />
    </div>
  )
}
