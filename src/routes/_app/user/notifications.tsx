import { createFileRoute } from "@tanstack/react-router";

import { NotificationList } from "@/components/notifications/notification-list";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { NotificationsSkeleton } from "@/components/skeletons";
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
		<div className="pb-8">
			<div className="container space-y-6 py-6">
				<PageToolbar
					title="Notifiche"
					meta="Tutti gli aggiornamenti sulle tue richieste e contenuti."
				/>
				<NotificationList />
			</div>
		</div>
	);
}
