import { Link } from "@tanstack/react-router"
import { ArrowRight, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { RequestStatusBadge } from "./request-status-badge"
import { RequestTypeBadge } from "./request-type-badge"

import type { ContentRequestWithMeta } from "@/lib/requests/types"

export function RequestCard({
  request,
  variant = "user",
}: {
  request: ContentRequestWithMeta
  variant?: "user" | "admin"
}) {
  const linkProps =
    variant === "admin"
      ? { to: "/admin/requests/$requestId" as const, params: { requestId: request.id } }
      : { to: "/user/requests/$requestId" as const, params: { requestId: request.id } }

  return (
    <Link
      {...linkProps}
      className={cn(
        "group block rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <RequestTypeBadge type={request.request_type} />
            <RequestStatusBadge status={request.status} />
          </div>

          <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
            {request.title}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {request.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" strokeWidth={1.5} />
              {request.target_label}
            </span>
            <span>
              {new Date(request.created_at).toLocaleDateString("it-IT")}
            </span>
          </div>
        </div>

        <ArrowRight className="mt-2 size-4 flex-shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  )
}
