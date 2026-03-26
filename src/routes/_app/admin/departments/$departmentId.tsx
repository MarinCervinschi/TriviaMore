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
import { CourseForm } from "@/components/admin/forms/course-form"
import { DepartmentForm } from "@/components/admin/forms/department-form"
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
  useCreateCourse,
  useDeleteCourse,
  useUpdateDepartment,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/departments/$departmentId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminQueries.department(params.departmentId),
    ),
  component: AdminDepartmentDetailPage,
  head: () => seoHead({ title: "Dettaglio Dipartimento | Gestione", noindex: true }),
})

function AdminDepartmentDetailPage() {
  const { departmentId } = Route.useParams()
  const { data } = useSuspenseQuery(adminQueries.department(departmentId))
  const [createCourseOpen, setCreateCourseOpen] = useState(false)
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  type CourseRow = {
    id: string
    name: string
    code: string
    course_type: string
    classes: { count: number }[]
  }

  const { sort, toggleSort } = useSort<CourseRow>()
  const updateDepartment = useUpdateDepartment()
  const createCourse = useCreateCourse(() => setCreateCourseOpen(false))
  const deleteCourse = useDeleteCourse(() => setDeleteCourseId(null))

  const { courses, ...department } = data

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    courses as CourseRow[],
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
        title={department.name}
        description={`Codice: ${department.code}`}
        backTo="/admin/departments"
        backLabel="Dipartimenti"
      />

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Modifica dipartimento</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentForm
              department={department}
              onSubmit={(formData) =>
                updateDepartment.mutate({ id: department.id, ...formData })
              }
              isPending={updateDepartment.isPending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Corsi ({courses.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-56">
                  <AdminSearch
                    value={search}
                    onChange={(v) => {
                      setSearch(v)
                      setPage(1)
                    }}
                    placeholder="Cerca corsi..."
                  />
                </div>
                <Button size="sm" onClick={() => setCreateCourseOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Nuovo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paged.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                {search
                  ? "Nessun corso trovato."
                  : "Nessun corso in questo dipartimento."}
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
                      <TableHead>
                        <SortableHeader label="Tipo" sortKey="course_type" sort={sort} onSort={toggleSort} />
                      </TableHead>
                      <TableHead className="text-center">Classi</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Link
                            to="/admin/courses/$courseId"
                            params={{ courseId: course.id }}
                            className="font-medium hover:underline"
                          >
                            {course.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {course.course_type === "BACHELOR"
                              ? "Triennale"
                              : "Magistrale"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {course.classes?.[0]?.count ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                to="/admin/courses/$courseId"
                                params={{ courseId: course.id }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteCourseId(course.id)}
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

      <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo corso</DialogTitle>
          </DialogHeader>
          <CourseForm
            departmentId={department.id}
            onSubmit={(formData) => createCourse.mutate(formData)}
            isPending={createCourse.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deleteCourseId}
        onOpenChange={(open) => !open && setDeleteCourseId(null)}
        title="Elimina corso"
        description="Sei sicuro di voler eliminare questo corso? L'operazione è irreversibile."
        confirmText="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (deleteCourseId) deleteCourse.mutate({ id: deleteCourseId })
        }}
      />
    </div>
  )
}
