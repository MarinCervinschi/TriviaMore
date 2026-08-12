import { ConfettiIcon } from "@solar-icons/react/linear/confetti";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { RAIL_ICON, RAIL_ITEM, RAIL_ITEM_IDLE } from "@/components/layout/nav-items";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { changelogQueries } from "@/lib/changelogs/queries";
import { cn } from "@/lib/utils";

export function SidebarChangelogMegaphone() {
	const { data: unreadVersions = [] } = useQuery(changelogQueries.unreadVersions());
	const unreadCount = unreadVersions.length;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link
					to="/news"
					aria-label={`Novità${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
					className={cn(RAIL_ITEM, RAIL_ITEM_IDLE)}
				>
					<ConfettiIcon className={RAIL_ICON} />
					{unreadCount > 0 && (
						<span
							className={cn(
								"bg-primary text-primary-foreground ring-background text-2xs absolute top-1 right-1 flex items-center justify-center rounded-full font-bold ring-2",
								unreadCount > 9 ? "h-[14px] min-w-[14px] px-0.5" : "h-[14px] w-[14px]"
							)}
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</Link>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={14}>
				Novità
			</TooltipContent>
		</Tooltip>
	);
}
