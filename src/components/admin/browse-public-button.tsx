import { Link } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

type BrowsePublicButtonProps = {
  to: string
  params?: Record<string, string>
}

export function BrowsePublicButton({ to, params }: BrowsePublicButtonProps) {
  return (
    <Button variant="outline" size="sm" className="rounded-xl" asChild>
      <Link to={to} params={params}>
        <Eye className="mr-1.5 h-4 w-4 text-primary" />
        Vedi pubblica
      </Link>
    </Button>
  )
}
