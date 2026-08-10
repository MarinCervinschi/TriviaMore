import { ConfettiIcon } from "@solar-icons/react/linear/confetti";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

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
					className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:ring-ring relative flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:outline-none"
				>
					<ConfettiIcon className="size-[18px]" />
					{unreadCount > 0 && (
						<span
							className={cn(
								"bg-primary text-primary-foreground ring-background absolute top-1 right-1 flex items-center justify-center rounded-full text-[9px] font-bold ring-2",
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
