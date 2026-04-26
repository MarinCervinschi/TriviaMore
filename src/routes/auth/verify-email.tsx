import { useEffect, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { requireGuest } from "@/lib/auth/guards"
import { resendConfirmationFn } from "@/lib/auth/server"

const RESEND_COOLDOWN_SECONDS = 60

type VerifyEmailSearch = {
  email?: string
}

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => {
    if (typeof search.email === "string" && search.email) {
      return { email: search.email }
    }
    return {}
  },
  beforeLoad: () => requireGuest(),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { email } = Route.useSearch()
  const [cooldown, setCooldown] = useState(0)

  const resend = useMutation({
    mutationFn: resendConfirmationFn,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Email inviata di nuovo. Controlla la tua casella di posta.")
        setCooldown(RESEND_COOLDOWN_SECONDS)
      } else {
        toast.error(result.error)
      }
    },
    onError: () => {
      toast.error("Impossibile inviare l'email. Riprova piu' tardi.")
    },
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const canResend = email && cooldown === 0 && !resend.isPending

  return (
    <AuthCard
      title="Controlla la tua casella di posta"
      description="Ti abbiamo inviato un link di conferma"
    >
      <div className="grid gap-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="h-8 w-8" />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {email ? (
            <>
              Abbiamo inviato un link di conferma a{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Clicca sul link per attivare il tuo account.
            </>
          ) : (
            <>Clicca sul link che ti abbiamo inviato via email per attivare il tuo account.</>
          )}
        </div>

        <div className="grid gap-2 text-center">
          <p className="text-sm text-muted-foreground">Non hai ricevuto l'email?</p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={!canResend}
            onClick={() => {
              if (!email) return
              resend.mutate({ data: { email } })
            }}
          >
            {resend.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Invio in corso...
              </>
            ) : cooldown > 0 ? (
              `Reinvia email (${cooldown}s)`
            ) : (
              "Reinvia email"
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Torna al login
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
