import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Library, Pencil, Plus, Trash2 } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
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
  useCreateDepartment,
  useDeleteDepartment,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/departments/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminQueries.departments()),
  component: AdminDepartmentsPage,
  head: () => seoHead({ title: "Dipartimenti | Gestione", noindex: true }),
})

function AdminDepartmentsPage() {
  const { data: departments } = useSuspenseQuery(adminQueries.departments())
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { sort, toggleSort } = useSort<(typeof departments)[0]>()

  const createDepartment = useCreateDepartment(() => setCreateOpen(false))
  const deleteDepartment = useDeleteDepartment(() => setDeleteId(null))

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    departments,
    (d, q) =>
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q),
    search,
    page,
    10,
    sort,
  )

  return (
    <div className="py-2">
      <AdminPageHeader
        title="Dipartimenti"
        description={`${departments.length} dipartimenti totali`}
        icon={Library}
        backTo="/admin"
        backLabel="Dashboard"
        actions={
          <Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo dipartimento
          </Button>
        }
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Lista dipartimenti</CardTitle>
            <div className="w-64">
              <AdminSearch
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setPage(1)
                }}
                placeholder="Cerca dipartimenti..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paged.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {search
                ? "Nessun dipartimento trovato."
                : "Nessun dipartimento. Crea il primo!"}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <SortableHeader label="Nome" sortKey="name" sort={sort} onSort={toggleSort} />
                    </TableHead>
                    <TableHead>
                      <SortableHeader label="Codice" sortKey="code" sort={sort} onSort={toggleSort} />
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium uppercase tracking-wider">Corsi</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((dept) => (
                    <TableRow key={dept.id} className="transition-colors hover:bg-muted/30">
                      <TableCell>
                        <Link
                          to="/admin/departments/$departmentId"
                          params={{ departmentId: dept.id }}
                          className="font-medium hover:underline"
                        >
                          {dept.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">{dept.code}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {dept.courses[0]?.count ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="rounded-lg" asChild>
                            <Link
                              to="/admin/departments/$departmentId"
                              params={{ departmentId: dept.id }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg"
                            onClick={() => setDeleteId(dept.id)}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo dipartimento</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onSubmit={(data) => createDepartment.mutate(data)}
            isPending={createDepartment.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Elimina dipartimento"
        description="Sei sicuro di voler eliminare questo dipartimento? L'operazione è irreversibile."
        confirmText="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteDepartment.mutate({ id: deleteId })
        }}
      />
    </div>
  )
}
