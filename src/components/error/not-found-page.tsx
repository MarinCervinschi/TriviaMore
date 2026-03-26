import { Link } from "@tanstack/react-router"
import { Home, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotFoundPage({
  message = "La pagina che stai cercando non esiste o è stata spostata.",
}: {
  message?: string
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-muted-foreground">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Pagina non trovata</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Torna alla home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/browse">
            <Search className="mr-2 h-4 w-4" />
            Esplora
          </Link>
        </Button>
      </div>
    </div>
  )
}
