import { useState } from "react"
import { FileEdit, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useHandleRequest } from "@/lib/requests/mutations"

const ACTIONS = [
  {
    status: "REJECTED" as const,
    label: "Rifiuta",
    icon: XCircle,
    color: "bg-red-500 hover:bg-red-600 text-white",
    description: "La proposta verra rifiutata e l'utente sara notificato.",
  },
  {
    status: "NEEDS_REVISION" as const,
    label: "Richiedi modifiche",
    icon: FileEdit,
    color: "bg-amber-500 hover:bg-amber-600 text-white",
    description: "L'utente ricevera una notifica per modificare la proposta.",
  },
]

export function HandleRequestDialog({
  requestId,
  open,
  onOpenChange,
}: {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<"REJECTED" | "NEEDS_REVISION" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const handleRequest = useHandleRequest(() => {
    onOpenChange(false)
    setSelectedStatus(null)
    setAdminNote("")
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rifiuta o richiedi modifiche</DialogTitle>
          <DialogDescription>
            Scegli un&apos;azione e lascia una nota per l&apos;utente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            {ACTIONS.map((action) => {
              const Icon = action.icon
              const isSelected = selectedStatus === action.status
              return (
                <button
                  key={action.status}
                  onClick={() => setSelectedStatus(action.status)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    isSelected
                      ? "border-foreground/20 bg-accent"
                      : "border-transparent hover:bg-accent/50"
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${action.color}`}>
                    <Icon className="size-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedStatus && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nota per l&apos;utente
              </label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Spiega il motivo..."
                rows={3}
                className="rounded-xl"
              />
            </div>
          )}

          <Button
            onClick={() => {
              if (!selectedStatus) return
              handleRequest.mutate({
                id: requestId,
                status: selectedStatus,
                admin_note: adminNote.trim() || undefined,
              })
            }}
            disabled={!selectedStatus || handleRequest.isPending}
            className="w-full rounded-xl"
          >
            {handleRequest.isPending ? "Salvataggio..." : "Conferma"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
