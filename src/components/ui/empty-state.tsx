import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-card p-12",
        className,
      )}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative orb */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />

      <div className="relative text-center">
        <motion.div
          className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-4"
          variants={item}
        >
          <Icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </motion.div>

        <motion.h2 className="mb-2 text-xl font-semibold" variants={item}>
          {title}
        </motion.h2>

        <motion.p className="mb-6 text-muted-foreground" variants={item}>
          {description}
        </motion.p>

        {actionLabel && actionHref && (
          <motion.div variants={item}>
            <Button asChild className="shadow-lg shadow-primary/25">
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          </motion.div>
        )}

        {actionLabel && onAction && !actionHref && (
          <motion.div variants={item}>
            <Button onClick={onAction} className="shadow-lg shadow-primary/25">
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
