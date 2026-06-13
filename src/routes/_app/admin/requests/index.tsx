import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { ArrowRight, Inbox } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminPagination,
  usePaginatedSearch,
} from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { SortableHeader, useSort } from "@/components/admin/sortable-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RequestStatusBadge } from "@/components/requests/request-status-badge"
import { RequestTypeBadge } from "@/components/requests/request-type-badge"
import { requestQueries } from "@/lib/requests/queries"

import type {
  AdminContentRequest,
  ContentRequestStatus,
  SubmittedContent,
} from "@/lib/requests/types"

// Open requests still await action; the rest are considered handled (approved,
// acknowledged or rejected) and are hidden from the default view.
const OPEN_STATUSES: ContentRequestStatus[] = ["PENDING", "NEEDS_REVISION"]
const isOpen = (r: AdminContentRequest) => OPEN_STATUSES.includes(r.status)
const isReport = (r: AdminContentRequest) => r.request_type === "REPORT"

type TypeTab = "proposals" | "reports"
type StatusFilter = "open" | "handled" | "all"

function generateTitle(submitted: SubmittedContent): string {
  if (submitted.type === "section") return `Nuova sezione: ${submitted.name}`
  if (submitted.type === "report") return "Segnalazione"
  if (submitted.type === "file_upload") return `File: ${submitted.file_name}`
  const count = submitted.questions.length
  return `${count} ${count === 1 ? "domanda" : "domande"}`
}

export const Route = createFileRoute("/_app/admin/requests/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(requestQueries.adminRequests()),
  head: () => seoHead({ title: "Richieste Contenuto", noindex: true }),
  component: AdminRequestsPage,
})

function AdminRequestsPage() {
  const { data: requests } = useSuspenseQuery(requestQueries.adminRequests())
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<TypeTab>("proposals")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open")
  const { sort, toggleSort } = useSort<AdminContentRequest>()

  const openProposals = requests.filter((r) => !isReport(r) && isOpen(r)).length
  const openReports = requests.filter((r) => isReport(r) && isOpen(r)).length

  const byTab = requests.filter((r) =>
    tab === "reports" ? isReport(r) : !isReport(r),
  )
  const filtered = byTab.filter((r) => {
    if (statusFilter === "open") return isOpen(r)
    if (statusFilter === "handled") return !isOpen(r)
    return true
  })

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    filtered,
    (item, query) =>
      generateTitle(item.submitted).toLowerCase().includes(query) ||
      item.target_label.toLowerCase().includes(query) ||
      (item.user.name?.toLowerCase().includes(query) ?? false),
    search,
    page,
    10,
    sort,
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Richieste Contenuto"
        description="Gestisci le richieste degli utenti per nuovi contenuti e segnalazioni."
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as TypeTab)
          setPage(1)
        }}
      >
        <TabsList className="rounded-2xl bg-muted/50 p-1">
          <TabsTrigger
            value="proposals"
            className="gap-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Contenuti proposti
            {openProposals > 0 && <TabCount value={openProposals} />}
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="gap-1.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Segnalazioni
            {openReports > 0 && <TabCount value={openReports} />}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Status filter + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "open", label: "Da gestire" },
            { value: "handled", label: "Gestite" },
            { value: "all", label: "Tutte" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value as StatusFilter)
                setPage(1)
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <AdminSearch value={search} onChange={(val) => { setSearch(val); setPage(1) }} />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={statusFilter === "open" ? "Nessuna richiesta da gestire" : "Nessuna richiesta"}
          description={
            tab === "reports"
              ? "Non ci sono segnalazioni in questa vista."
              : "Non ci sono contenuti proposti in questa vista."
          }
        />
      ) : paged.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nessun risultato"
          description="Prova a modificare i filtri o la ricerca."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Utente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>
                    <SortableHeader label="Data" sortKey="created_at" sort={sort} onSort={toggleSort} />
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((request) => (
                  <TableRow key={request.id} className="group">
                    <TableCell className="py-4 pl-6">
                      <Link
                        to="/admin/requests/$requestId"
                        params={{ requestId: request.id }}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={request.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {(request.user.name?.[0] ?? request.user.email?.[0] ?? "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium transition-colors group-hover:text-primary">
                          {request.user.name ?? request.user.email ?? "Utente"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <RequestTypeBadge type={request.request_type} />
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString("it-IT")}
                    </TableCell>
                    <TableCell className="pr-6">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={10}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

function TabCount({ value }: { value: number }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
      {value}
    </span>
  )
}
