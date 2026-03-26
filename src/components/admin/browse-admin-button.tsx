import { Link } from "@tanstack/react-router"
import { Settings } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

type BrowseAdminButtonProps = {
  to: string
  params?: Record<string, string>
}

export function BrowseAdminButton({ to, params }: BrowseAdminButtonProps) {
  const { user } = useAuth()

  const isAdmin =
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MAINTAINER"

  if (!isAdmin) return null

  return (
    <Button variant="outline" size="sm" className="rounded-xl" asChild>
      <Link to={to} params={params}>
        <Settings className="mr-1.5 h-4 w-4 text-primary" />
        Gestisci
      </Link>
    </Button>
  )
}
