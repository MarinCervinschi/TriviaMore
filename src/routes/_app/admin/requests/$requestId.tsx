import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { ArrowLeft, MapPin, Settings2 } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HandleRequestDialog } from "@/components/requests/handle-request-dialog"
import { RequestCommentForm } from "@/components/requests/request-comment-form"
import { RequestCommentList } from "@/components/requests/request-comment-list"
import { RequestStatusBadge } from "@/components/requests/request-status-badge"
import { RequestTypeBadge } from "@/components/requests/request-type-badge"
import { requestQueries } from "@/lib/requests/queries"

export const Route = createFileRoute("/_app/admin/requests/$requestId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      requestQueries.requestDetail(params.requestId),
    ),
  head: () => seoHead({ title: "Dettaglio Richiesta", noindex: true }),
  component: AdminRequestDetailPage,
})

function AdminRequestDetailPage() {
  const { requestId } = Route.useParams()
  const { data: request } = useSuspenseQuery(
    requestQueries.requestDetail(requestId),
  )
  const [handleOpen, setHandleOpen] = useState(false)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dettaglio Richiesta"
        description=""
      />

      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 rounded-xl">
          <Link to="/admin/requests">
            <ArrowLeft className="size-4" />
            Torna alle richieste
          </Link>
        </Button>

        {request.status === "PENDING" || request.status === "NEEDS_REVISION" ? (
          <Button
            onClick={() => setHandleOpen(true)}
            className="gap-2 rounded-xl"
          >
            <Settings2 className="size-4" />
            Gestisci
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Request card */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <RequestTypeBadge type={request.request_type} />
              <RequestStatusBadge status={request.status} />
            </div>

            <h2 className="text-xl font-bold tracking-tight">
              {request.title}
            </h2>

            <p className="text-sm leading-relaxed text-foreground/90">
              {request.description}
            </p>

            {request.admin_note && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Nota amministratore
                </p>
                <p className="mt-1 text-sm">{request.admin_note}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Commenti</h3>
            <RequestCommentList comments={request.comments} />
            <Separator />
            <RequestCommentForm requestId={request.id} />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* User info */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Richiedente
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.user.image ?? undefined} />
                <AvatarFallback className="text-xs font-semibold">
                  {(request.user.name?.[0] ?? request.user.email?.[0] ?? "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {request.user.name ?? "Utente"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Target
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span>{request.target_label}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dettagli
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creata</span>
                <span>
                  {new Date(request.created_at).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {request.handled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gestita</span>
                  <span>
                    {new Date(request.handled_at).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HandleRequestDialog
        requestId={request.id}
        open={handleOpen}
        onOpenChange={setHandleOpen}
      />
    </div>
  )
}
