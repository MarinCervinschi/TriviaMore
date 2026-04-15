import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
import { ChangelogForm } from "@/components/admin/forms/changelog-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils"
import { useCreateChangelog, useDeleteChangelog } from "@/lib/changelogs/mutations"
import { changelogQueries } from "@/lib/changelogs/queries"
import { CATEGORY_CONFIG } from "@/lib/changelogs/types"

export const Route = createFileRoute("/_app/admin/changelogs/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(changelogQueries.adminList()),
  component: AdminChangelogsPage,
  head: () => seoHead({ title: "Changelog | Gestione", noindex: true }),
})

function AdminChangelogsPage() {
  const { data: changelogs } = useSuspenseQuery(changelogQueries.adminList())
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { sort, toggleSort } = useSort<(typeof changelogs)[0]>()

  const createChangelog = useCreateChangelog(() => setCreateOpen(false))
  const deleteChangelog = useDeleteChangelog(() => setDeleteId(null))

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    changelogs,
    (c, q) =>
      c.version.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q),
    search,
    page,
    10,
    sort,
  )

  return (
    <div className="py-2">
      <AdminPageHeader
        title="Changelog"
        description={`${changelogs.length} changelog totali`}
        icon={Megaphone}
        backTo="/admin"
        backLabel="Dashboard"
        actions={
          <Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo changelog
          </Button>
        }
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Lista changelog</CardTitle>
            <div className="w-64">
              <AdminSearch
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setPage(1)
                }}
                placeholder="Cerca changelog..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paged.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {search
                ? "Nessun changelog trovato."
                : "Nessun changelog. Crea il primo!"}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <SortableHeader
                        label="Versione"
                        sortKey="version"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Titolo"
                        sortKey="title"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium uppercase tracking-wider">
                      Categoria
                    </TableHead>
                    <TableHead className="text-center text-xs font-medium uppercase tracking-wider">
                      Stato
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Data"
                        sortKey="created_at"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider">
                      Azioni
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((entry) => {
                    const catConfig =
                      CATEGORY_CONFIG[
                        entry.category as keyof typeof CATEGORY_CONFIG
                      ]
                    return (
                      <TableRow
                        key={entry.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="rounded-full font-mono"
                          >
                            v{entry.version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/admin/changelogs/$changelogId"
                            params={{ changelogId: entry.id }}
                            className="font-medium hover:underline"
                          >
                            {entry.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {catConfig && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full",
                                catConfig.bg,
                                catConfig.color,
                                catConfig.border,
                              )}
                            >
                              {catConfig.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full",
                              entry.is_draft
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
                            )}
                          >
                            {entry.is_draft ? "Bozza" : "Pubblicato"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString(
                            "it-IT",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg"
                              asChild
                            >
                              <Link
                                to="/admin/changelogs/$changelogId"
                                params={{ changelogId: entry.id }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg"
                              onClick={() => setDeleteId(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuovo changelog</DialogTitle>
            <DialogDescription>
              Crea un nuovo changelog. Verrà salvato come bozza.
            </DialogDescription>
          </DialogHeader>
          <ChangelogForm
            onSubmit={(data) => createChangelog.mutate(data)}
            isPending={createChangelog.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Elimina changelog"
        description="Sei sicuro di voler eliminare questo changelog? L'operazione è irreversibile."
        confirmText="Elimina"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteChangelog.mutate({ id: deleteId })
        }}
      />
    </div>
  )
}
