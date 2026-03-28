import { useRef, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
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

import type { MotionValue } from "framer-motion"

// Dock magnification config (must match luma-bar.tsx)
const ICON_SIZE = 40
const MAGNIFIED_SIZE = 56
const DISTANCE = 120
const SPRING_CONFIG = { mass: 0.1, stiffness: 200, damping: 18 }

export function DockNotificationBell({
  mouseX,
  prefersReduced,
}: {
  mouseX: MotionValue<number>
  prefersReduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distance,
    [-DISTANCE, 0, DISTANCE],
    [ICON_SIZE, MAGNIFIED_SIZE, ICON_SIZE],
  )
  const width = useSpring(widthSync, SPRING_CONFIG)

  const scaleSync = useTransform(width, [ICON_SIZE, MAGNIFIED_SIZE], [1, 1.2])
  const scale = useSpring(scaleSync, SPRING_CONFIG)

  const effectiveWidth = prefersReduced ? ICON_SIZE : width
  const effectiveScale = prefersReduced ? 1 : scale

  const { data: unreadCount = 0 } = useQuery(notificationQueries.unreadCount())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <motion.div
              ref={ref}
              style={{ width: effectiveWidth }}
              className="aspect-square"
            >
              <button
                className="relative z-10 flex h-full w-full items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
              >
                <motion.div
                  className="relative flex items-center justify-center"
                  style={{ scale: effectiveScale }}
                >
                  <Bell className="size-5" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span
                      className={cn(
                        "absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground",
                        unreadCount > 9
                          ? "h-4 min-w-4 px-0.5"
                          : "h-3.5 w-3.5",
                      )}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </motion.div>
              </button>
            </motion.div>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={12}>
          Notifiche
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="top"
        sideOffset={16}
        align="end"
        className="w-80 p-0"
      >
        <NotificationPopover onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
