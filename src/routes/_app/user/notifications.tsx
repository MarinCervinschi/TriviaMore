import { BellIcon } from "@solar-icons/react/linear/bell";
import { createFileRoute } from "@tanstack/react-router";

import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationsSkeleton } from "@/components/skeletons";
import { UserHero } from "@/components/user/user-hero";
import { notificationQueries } from "@/lib/notifications/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/user/notifications")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(notificationQueries.all()),
	head: () => seoHead({ title: "Notifiche", noindex: true }),
	pendingComponent: NotificationsSkeleton,
	component: NotificationsPage,
});

function NotificationsPage() {
	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={BellIcon}
				title="Notifiche"
				description="Tutti gli aggiornamenti sulle tue richieste e contenuti."
			/>

			<div className="container">
				<NotificationList />
			</div>
		</div>
	);
}
