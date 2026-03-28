import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import type { ContentRequestCommentWithUser } from "@/lib/requests/types"

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email?.[0]?.toUpperCase() ?? "?"
}

export function RequestCommentList({
  comments,
}: {
  comments: ContentRequestCommentWithUser[]
}) {
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nessun commento ancora.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const isAdmin = comment.user.role !== "STUDENT"
        return (
          <div
            key={comment.id}
            className="flex gap-3 rounded-xl border bg-card/50 p-3"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={comment.user.image ?? undefined}
                alt={comment.user.name ?? "Utente"}
              />
              <AvatarFallback className="text-[10px] font-semibold">
                {getInitials(comment.user.name, comment.user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {comment.user.name ?? comment.user.email ?? "Utente"}
                </span>
                {isAdmin && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 bg-primary/10 text-[10px] text-primary"
                  >
                    Staff
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">
                {comment.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
