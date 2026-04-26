import { Link, createFileRoute } from "@tanstack/react-router"
import { AlertCircle } from "lucide-react"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/auth/auth-code-error")({
  component: AuthCodeErrorPage,
})

function AuthCodeErrorPage() {
  return (
    <AuthCard
      title="Link non valido"
      description="Non e' stato possibile confermare la tua email"
    >
      <div className="grid gap-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Il link di conferma e' scaduto o e' gia' stato utilizzato. Prova a
          richiedere un nuovo link dalla pagina di registrazione.
        </p>

        <div className="grid gap-3">
          <Button asChild size="lg" className="w-full shadow-lg shadow-primary/25">
            <Link to="/auth/register">Registrati di nuovo</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/auth/login">Vai al login</Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  )
}
