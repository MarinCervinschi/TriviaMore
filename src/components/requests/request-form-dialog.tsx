import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RequestForm } from "./request-form"

export function RequestFormDialog({
  defaultTargetClassId,
  defaultTargetSectionId,
  trigger,
}: {
  defaultTargetClassId?: string
  defaultTargetSectionId?: string
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 rounded-xl shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            Proponi contenuto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Proponi contenuto</DialogTitle>
          <DialogDescription>
            Proponi nuove sezioni o domande per la piattaforma.
          </DialogDescription>
        </DialogHeader>
        <RequestForm
          defaultTargetClassId={defaultTargetClassId}
          defaultTargetSectionId={defaultTargetSectionId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
