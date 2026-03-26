import { Link, useRouter } from "@tanstack/react-router"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ErrorPage({
  error,
}: {
  error: Error
}) {
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h1 className="mt-4 text-2xl font-semibold">Qualcosa è andato storto</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Si è verificato un errore imprevisto. Riprova o torna alla home.
      </p>
      {import.meta.env.DEV && error.message && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-md bg-muted p-3 text-left text-xs">
          {error.message}
        </pre>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={() => router.invalidate()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Riprova
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Torna alla home
          </Link>
        </Button>
      </div>
    </div>
  )
}
