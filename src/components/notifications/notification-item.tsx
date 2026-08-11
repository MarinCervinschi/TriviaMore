import { BellIcon } from "@solar-icons/react/linear/bell";
import { ChatSquareIcon } from "@solar-icons/react/linear/chat-square";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { InboxIcon } from "@solar-icons/react/linear/inbox";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";
import { RefreshIcon } from "@solar-icons/react/linear/refresh";
import { StarsIcon } from "@solar-icons/react/linear/stars";
import { Link } from "@tanstack/react-router";

import type { Icon } from "@/components/icons";
import { CloseGlyph } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

const typeConfig: Record<Notification["type"], { icon: Icon; color: string }> = {
	REQUEST_STATUS_CHANGED: { icon: CheckCircleIcon, color: "text-green-500" },
	NEW_REQUEST_RECEIVED: { icon: InboxIcon, color: "text-blue-500" },
	REQUEST_NEEDS_REVISION: { icon: PenNewSquareIcon, color: "text-amber-500" },
	REQUEST_REVISED: { icon: RefreshIcon, color: "text-purple-500" },
	CONTENT_UPDATED: { icon: StarsIcon, color: "text-brand" },
	NEW_SECTION_ADDED: { icon: ChatSquareIcon, color: "text-brand" },
	MAINTAINER_ASSIGNED: { icon: DiplomaIcon, color: "text-brand" },
};

function timeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "Ora";
	if (minutes < 60) return `${minutes}m fa`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h fa`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}g fa`;
	return formatDate(dateStr);
}

export function NotificationItem({
	notification,
	onMarkRead,
	onDelete,
	onNavigate,
	compact = false,
}: {
	notification: Notification;
	onMarkRead?: (id: string) => void;
	onDelete?: (id: string) => void;
	onNavigate?: () => void;
	compact?: boolean;
}) {
	const config = typeConfig[notification.type] ?? {
		icon: BellIcon,
		color: "text-muted-foreground",
	};
	const Icon = config.icon;

	const content = (
		<div
			className={cn(
				"group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors",
				!notification.isRead && "bg-primary/5",
				notification.link && "hover:bg-accent/50 cursor-pointer"
			)}
		>
			<div
				className={cn(
					"flex-shrink-0 rounded-xl p-2",
					notification.isRead ? "bg-muted" : "bg-primary/10"
				)}
			>
				<Icon
					className={cn(
						"size-4",
						notification.isRead ? "text-muted-foreground" : config.color
					)}
				/>
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<p
						className={cn(
							"text-sm leading-snug",
							!notification.isRead && "font-medium"
						)}
					>
						{notification.title}
					</p>
					{!compact && !notification.isRead && (
						<span className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
					)}
				</div>
				{notification.body && (
					<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
						{notification.body}
					</p>
				)}
				<p className="text-muted-foreground/70 mt-1 text-xs">
					{timeAgo(notification.createdAt)}
				</p>
			</div>

			{!compact && onDelete && (
				<Button
					variant="ghost"
					size="icon"
					className="size-7 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						onDelete(notification.id);
					}}
					aria-label="Elimina la notifica"
				>
					<CloseGlyph className="size-3.5" />
				</Button>
			)}
		</div>
	);

	if (notification.link) {
		return (
			<Link
				to={notification.link as string}
				onClick={() => {
					if (!notification.isRead && onMarkRead) {
						onMarkRead(notification.id);
					}
					onNavigate?.();
				}}
			>
				{content}
			</Link>
		);
	}

	return content;
}
