import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Pencil } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adminQueries } from "@/lib/admin/queries"
import type { AdminUser } from "@/lib/admin/types"

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  MAINTAINER: "Maintainer",
  STUDENT: "Studente",
}

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUPERADMIN: "destructive",
  ADMIN: "default",
  MAINTAINER: "secondary",
  STUDENT: "outline",
}

export const Route = createFileRoute("/_app/admin/users/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminQueries.users()),
  component: AdminUsersPage,
  head: () => seoHead({ title: "Utenti | Gestione", noindex: true }),
})

function AdminUsersPage() {
  const { data: users } = useSuspenseQuery(adminQueries.users())
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const { sort, toggleSort } = useSort<AdminUser>()

  const filtered = roleFilter === "all"
    ? users
    : users.filter((u) => u.role === roleFilter)

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    filtered,
    (u, q) =>
      (u.name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false),
    search,
    page,
    10,
    sort,
  )

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="py-2">
      <AdminPageHeader
        title="Utenti"
        description={`${users.length} utenti registrati`}
        backTo="/admin"
        backLabel="Dashboard"
      />

      {/* Role filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge
          variant={roleFilter === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => {
            setRoleFilter("all")
            setPage(1)
          }}
        >
          Tutti ({users.length})
        </Badge>
        {(["SUPERADMIN", "ADMIN", "MAINTAINER", "STUDENT"] as const).map(
          (role) => (
            <Badge
              key={role}
              variant={roleFilter === role ? ROLE_VARIANTS[role] : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setRoleFilter(role)
                setPage(1)
              }}
            >
              {ROLE_LABELS[role]} ({roleCounts[role] ?? 0})
            </Badge>
          ),
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Lista utenti</CardTitle>
            <div className="w-64">
              <AdminSearch
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setPage(1)
                }}
                placeholder="Cerca per nome o email..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paged.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {search || roleFilter !== "all"
                ? "Nessun utente trovato."
                : "Nessun utente registrato."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utente</TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Ruolo"
                        sortKey="role"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="text-center">
                      <SortableHeader
                        label="Quiz"
                        sortKey="quiz_attempts_count"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Registrato"
                        sortKey="created_at"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.image ?? undefined}
                              alt={user.name ?? ""}
                            />
                            <AvatarFallback className="text-xs">
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to="/admin/users/$userId"
                              params={{ userId: user.id }}
                              className="font-medium hover:underline"
                            >
                              {user.name ?? "—"}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANTS[user.role]}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.quiz_attempts_count}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("it-IT")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to="/admin/users/$userId"
                            params={{ userId: user.id }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
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
  )
}
