import { useState } from "react";

import { BellIcon } from "@solar-icons/react/linear/bell";
import { useQuery } from "@tanstack/react-query";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { notificationQueries } from "@/lib/notifications/queries";

import { NotificationPopover } from "./notification-popover";

/**
 * Sits in the sidebar's header beside the brand, not in the menu — a row of its own
 * cost more vertical space than the thing is worth. Collapsed it keeps the same box
 * as a menu button, so it lands on the icons' axis.
 *
 * The unread state is a dot rather than a count: there is no room for a number next
 * to a 16px glyph, and the number is in the popover anyway.
 */
export function SidebarNotificationBell() {
	const [open, setOpen] = useState(false);
	const { isMobile } = useSidebar();
	const { data: unreadCount = 0 } = useQuery(notificationQueries.unreadCount());

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
					className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring focus-visible:shadow-focus relative flex size-8 shrink-0 items-center justify-center rounded-lg outline-hidden transition-colors focus-visible:ring-2"
				>
					<BellIcon className="size-4" />
					{unreadCount > 0 && (
						<span
							aria-hidden
							className="bg-primary ring-sidebar absolute top-1 right-1 size-2 rounded-full ring-2"
						/>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent
				side={isMobile ? "bottom" : "right"}
				sideOffset={12}
				align="start"
				className="w-80 p-0"
			>
				<NotificationPopover onClose={() => setOpen(false)} />
			</PopoverContent>
		</Popover>
	);
}
