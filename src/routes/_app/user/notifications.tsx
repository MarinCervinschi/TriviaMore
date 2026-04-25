import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Bell } from "lucide-react"

import { NotificationsSkeleton } from "@/components/skeletons"
import { UserHero } from "@/components/user/user-hero"
import { NotificationList } from "@/components/notifications/notification-list"
import { notificationQueries } from "@/lib/notifications/queries"

export const Route = createFileRoute("/_app/user/notifications")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(notificationQueries.all()),
  head: () => seoHead({ title: "Notifiche", noindex: true }),
  pendingComponent: NotificationsSkeleton,
  component: NotificationsPage,
})

function NotificationsPage() {
  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={Bell}
        title="Notifiche"
        description="Tutti gli aggiornamenti sulle tue richieste e contenuti."
      />

      <div className="container">
        <NotificationList />
      </div>
    </div>
  )
}
