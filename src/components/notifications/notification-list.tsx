import { useSuspenseQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { BellOff } from "lucide-react"

import { notificationQueries } from "@/lib/notifications/queries"
import {
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from "@/lib/notifications/mutations"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import { NotificationItem } from "./notification-item"

export function NotificationList() {
  const { data: notifications } = useSuspenseQuery(notificationQueries.all())
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()
  const prefersReduced = useReducedMotion()

  const hasUnread = notifications.some((n) => !n.is_read)

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={BellOff}
        title="Nessuna notifica"
        description="Quando riceverai aggiornamenti sulle tue richieste, appariranno qui."
      />
    )
  }

  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Segna tutte come lette
          </Button>
        </div>
      )}

      <motion.div
        className="space-y-2"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            variants={item}
            className="rounded-2xl border bg-card transition-all duration-300 hover:shadow-md"
          >
            <NotificationItem
              notification={notification}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => deleteNotification.mutate(id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
