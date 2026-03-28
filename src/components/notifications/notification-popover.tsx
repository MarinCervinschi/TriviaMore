import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, BellOff } from "lucide-react"

import { notificationQueries } from "@/lib/notifications/queries"
import { useMarkRead, useMarkAllRead } from "@/lib/notifications/mutations"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NotificationItem } from "./notification-item"

export function NotificationPopover({ onClose }: { onClose: () => void }) {
  const { data: notifications = [] } = useQuery(notificationQueries.all())
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const recent = notifications.slice(0, 5)
  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Notifiche</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-primary"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Segna tutte come lette
          </Button>
        )}
      </div>

      <Separator />

      {/* Notification list */}
      {recent.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <BellOff className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Nessuna notifica
          </p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto py-1">
          {recent.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => markRead.mutate(id)}
              onNavigate={onClose}
              compact
            />
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-1 text-xs"
              onClick={onClose}
            >
              <Link to="/user/notifications">
                Vedi tutte
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
