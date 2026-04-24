import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, LogOut, ShieldCheck, Sparkles } from "lucide-react"

import { AcceptanceCheckboxes } from "@/components/legal/acceptance-checkboxes"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth/guards"
import { logoutFn } from "@/lib/auth/server"
import { useAcceptLegal } from "@/lib/legal/mutations"
import { getCurrentLegalNotes } from "@/lib/legal/versions"
import { seoHead } from "@/lib/seo"

export const Route = createFileRoute("/_app/legal/accept")({
  beforeLoad: () => requireAuth(),
  head: () =>
    seoHead({
      title: "Aggiornamento documenti legali",
      noindex: true,
    }),
  component: AcceptPage,
})

function AcceptPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const acceptLegal = useAcceptLegal()
  const notes = getCurrentLegalNotes()

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const canSubmit = termsAccepted && privacyAccepted

  const handleAccept = async () => {
    if (!canSubmit) {
      setShowErrors(true)
      return
    }
    const result = await acceptLegal.mutateAsync({
      terms_accepted: true,
      privacy_accepted: true,
    })
    if (result.success) {
      navigate({ to: "/" })
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    await logoutFn()
    queryClient.clear()
    navigate({ to: "/legal/declined" })
  }

  return (
    <div className="container flex max-w-2xl items-center justify-center py-12 sm:py-20">
      <div className="w-full space-y-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3">
            <ShieldCheck
              className="h-6 w-6 text-primary"
              strokeWidth={1.5}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Aggiornamento dei documenti legali
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Per continuare a utilizzare TriviaMore, è necessario
              prendere visione e accettare i Termini e Condizioni e
              l'Informativa sulla Privacy aggiornati.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              strokeWidth={2}
            />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {notes.title}
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {notes.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <AcceptanceCheckboxes
          termsAccepted={termsAccepted}
          privacyAccepted={privacyAccepted}
          onTermsChange={setTermsAccepted}
          onPrivacyChange={setPrivacyAccepted}
          termsError={
            showErrors && !termsAccepted
              ? "Devi accettare i Termini e Condizioni per continuare"
              : undefined
          }
          privacyError={
            showErrors && !privacyAccepted
              ? "Devi accettare l'Informativa sulla Privacy per continuare"
              : undefined
          }
          disabled={acceptLegal.isPending || isDeclining}
        />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDecline}
            disabled={acceptLegal.isPending || isDeclining}
          >
            {isDeclining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Rifiuta e esci
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={acceptLegal.isPending || isDeclining}
          >
            {acceptLegal.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Accetta e continua
          </Button>
        </div>
      </div>
    </div>
  )
}
