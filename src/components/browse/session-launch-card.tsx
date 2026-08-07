import { Link } from "@tanstack/react-router"
import { ArrowRight, LogIn } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const accents = {
  blue: {
    border: "border-blue-500/20",
    gradient: "from-blue-500/5",
    badge: "bg-blue-500/10",
    icon: "text-blue-600",
  },
  purple: {
    border: "border-purple-500/20",
    gradient: "from-purple-500/5",
    badge: "bg-purple-500/10",
    icon: "text-purple-600",
  },
} as const

// Shared shell for the quiz and flashcard launch cards on a section page. The
// two differed only by accent, icon, and copy; the icon badge, the count line,
// and the sign-in-aware call to action are identical. Callers keep the auth
// query and the lazy dialog and pass `isAuthenticated` + `onStart` in.
export function SessionLaunchCard({
  accent,
  icon: Icon,
  title,
  unitLabel,
  count,
  isAuthenticated,
  onStart,
}: {
  accent: keyof typeof accents
  icon: LucideIcon
  title: string
  unitLabel: string
  count: number
  isAuthenticated: boolean
  onStart: () => void
}) {
  const colors = accents[accent]

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-r via-card to-card p-4 sm:p-5",
        colors.border,
        colors.gradient,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("inline-flex shrink-0 rounded-xl p-2.5", colors.badge)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{count}</span>{" "}
            {unitLabel}
          </p>
        </div>
        {isAuthenticated ? (
          <Button size="sm" className="shrink-0 shadow-sm" onClick={onStart}>
            Inizia
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="shrink-0 shadow-sm" asChild>
            <Link to="/auth/register">
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Registrati
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
