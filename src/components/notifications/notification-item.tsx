import { Link } from "@tanstack/react-router"
import {
  Bell,
  CheckCircle2,
  FileEdit,
  Inbox,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import type { Notification } from "@/lib/notifications/types"
import type { LucideIcon } from "lucide-react"

const typeConfig: Record<
  Notification["type"],
  { icon: LucideIcon; color: string }
> = {
  REQUEST_STATUS_CHANGED: { icon: CheckCircle2, color: "text-green-500" },
  NEW_REQUEST_RECEIVED: { icon: Inbox, color: "text-blue-500" },
  REQUEST_NEEDS_REVISION: { icon: FileEdit, color: "text-amber-500" },
  REQUEST_REVISED: { icon: RefreshCw, color: "text-purple-500" },
  CONTENT_UPDATED: { icon: Sparkles, color: "text-primary" },
  NEW_SECTION_ADDED: { icon: MessageSquare, color: "text-primary" },
  ANNOUNCEMENT: { icon: Megaphone, color: "text-primary" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Ora"
  if (minutes < 60) return `${minutes}m fa`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h fa`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}g fa`
  return new Date(dateStr).toLocaleDateString("it-IT")
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
  compact = false,
}: {
  notification: Notification
  onMarkRead?: (id: string) => void
  onDelete?: (id: string) => void
  onNavigate?: () => void
  compact?: boolean
}) {
  const config = typeConfig[notification.type] ?? {
    icon: Bell,
    color: "text-muted-foreground",
  }
  const Icon = config.icon

  const content = (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors",
        !notification.is_read && "bg-primary/5",
        notification.link && "hover:bg-accent/50 cursor-pointer",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 rounded-xl p-2",
          notification.is_read ? "bg-muted" : "bg-primary/10",
        )}
      >
        <Icon
          className={cn(
            "size-4",
            notification.is_read ? "text-muted-foreground" : config.color,
          )}
          strokeWidth={1.5}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              !notification.is_read && "font-medium",
            )}
          >
            {notification.title}
          </p>
          {!compact && !notification.is_read && (
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.body && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/70">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {!compact && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(notification.id)
          }}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link
        to={notification.link as string}
        onClick={() => {
          if (!notification.is_read && onMarkRead) {
            onMarkRead(notification.id)
          }
          onNavigate?.()
        }}
      >
        {content}
      </Link>
    )
  }

  return content
}
