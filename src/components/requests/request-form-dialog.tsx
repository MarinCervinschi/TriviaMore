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
import { useCreateRequest } from "@/lib/requests/mutations"
import { RequestForm } from "./request-form"

import type { ContentRequestInput } from "@/lib/requests/schemas"

export function RequestFormDialog({
  defaultValues,
  trigger,
}: {
  defaultValues?: Partial<ContentRequestInput>
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const createRequest = useCreateRequest(() => setOpen(false))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 rounded-xl shadow-lg shadow-primary/25">
            <Plus className="size-4" />
            Nuova richiesta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova richiesta di contenuto</DialogTitle>
          <DialogDescription>
            Compila il modulo per inviare una richiesta agli amministratori.
          </DialogDescription>
        </DialogHeader>
        <RequestForm
          defaultValues={defaultValues}
          onSubmit={(data) => createRequest.mutate(data)}
          isPending={createRequest.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
