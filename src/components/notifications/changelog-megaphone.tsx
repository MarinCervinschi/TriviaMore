import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Megaphone } from "lucide-react"

import { cn } from "@/lib/utils"
import { changelogQueries } from "@/lib/changelogs/queries"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SidebarChangelogMegaphone() {
  const { data: unreadVersions = [] } = useQuery(
    changelogQueries.unreadVersions(),
  )
  const unreadCount = unreadVersions.length

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/news"
          aria-label={`Novità${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
          className="relative flex h-[42px] w-[42px] items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Megaphone className="size-[18px]" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-1 top-1 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background",
                unreadCount > 9
                  ? "h-[14px] min-w-[14px] px-0.5"
                  : "h-[14px] w-[14px]",
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
  )
}
