import { useState } from "react";

import { BellIcon } from "@solar-icons/react/linear/bell";
import { useQuery } from "@tanstack/react-query";

import { RAIL_ICON, RAIL_ITEM, RAIL_ITEM_IDLE } from "@/components/layout/nav-items";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { notificationQueries } from "@/lib/notifications/queries";
import { cn } from "@/lib/utils";

import { NotificationPopover } from "./notification-popover";

export function SidebarNotificationBell() {
	const [open, setOpen] = useState(false);
	const { data: unreadCount = 0 } = useQuery(notificationQueries.unreadCount());

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<button
							aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
							className={cn(RAIL_ITEM, RAIL_ITEM_IDLE)}
						>
							<BellIcon className={RAIL_ICON} />
							{unreadCount > 0 && (
								<span
									className={cn(
										"bg-primary text-primary-foreground ring-background text-2xs absolute top-1 right-1 flex items-center justify-center rounded-full font-bold ring-2",
										unreadCount > 9
											? "h-[14px] min-w-[14px] px-0.5"
											: "h-[14px] w-[14px]"
									)}
								>
									{unreadCount > 99 ? "99+" : unreadCount}
								</span>
							)}
						</button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={14}>
					Notifiche
				</TooltipContent>
			</Tooltip>

			<PopoverContent side="right" sideOffset={16} align="end" className="w-80 p-0">
				<NotificationPopover onClose={() => setOpen(false)} />
			</PopoverContent>
		</Popover>
	);
}
