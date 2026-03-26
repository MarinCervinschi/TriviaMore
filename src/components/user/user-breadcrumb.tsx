import { Link } from "@tanstack/react-router"
import { ChevronRight, Home } from "lucide-react"

export function UserBreadcrumb({ current }: { current: string }) {
  return (
    <nav className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm backdrop-blur-sm">
      <Link
        to="/user"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
      <span className="font-medium text-foreground">{current}</span>
    </nav>
  )
}
