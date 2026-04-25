import { useState } from "react"
import { Bell } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import { notificationQueries } from "@/lib/notifications/queries"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationPopover } from "./notification-popover"

export function SidebarNotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: unreadCount = 0 } = useQuery(notificationQueries.unreadCount())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
              className="relative flex h-[42px] w-[42px] items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bell className="size-[18px]" strokeWidth={1.5} />
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
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14}>
          Notifiche
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="right"
        sideOffset={16}
        align="end"
        className="w-80 p-0"
      >
        <NotificationPopover onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
