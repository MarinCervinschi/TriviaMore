import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { BellOffIcon } from "@solar-icons/react/linear/bell-off";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMarkAllRead, useMarkRead } from "@/lib/notifications/mutations";
import { notificationQueries } from "@/lib/notifications/queries";

import { NotificationItem } from "./notification-item";

export function NotificationPopover({ onClose }: { onClose: () => void }) {
	const { data: notifications = [] } = useQuery(notificationQueries.all());
	const markRead = useMarkRead();
	const markAllRead = useMarkAllRead();

	const unread = notifications.filter(n => !n.isRead).slice(0, 5);

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3">
				<h3 className="text-sm font-semibold">Notifiche</h3>
				{unread.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						className="text-primary h-auto px-2 py-1 text-xs"
						onClick={() => markAllRead.mutate()}
						disabled={markAllRead.isPending}
					>
						Segna tutte come lette
					</Button>
				)}
			</div>

			<Separator />

			{/* Notification list */}
			{unread.length === 0 ? (
				<div className="flex flex-col items-center gap-2 py-8 text-center">
					<BellOffIcon className="text-muted-foreground/40 size-8" />
					<p className="text-muted-foreground text-sm">Nessuna notifica non letta</p>
				</div>
			) : (
				<div className="max-h-[300px] overflow-y-auto py-1">
					{unread.map(notification => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							onMarkRead={id => markRead.mutate(id)}
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
								<ArrowRightIcon className="size-3" />
							</Link>
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
