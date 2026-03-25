import { Link } from "@tanstack/react-router"
import { ChevronRight, Home } from "lucide-react"

export function UserBreadcrumb({ current }: { current: string }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link
        to="/user"
        className="flex items-center gap-1 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground">{current}</span>
    </nav>
  )
}
