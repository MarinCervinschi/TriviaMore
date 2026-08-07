import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { AnimatedStack } from "@/components/session-config/animated-block"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Shared chrome for the quiz / flashcard / exam start dialogs. `SessionDialogShell`
// is the modal + two-column grid (config on the left, live summary on the right);
// `SessionDialogColumn` is the left config column: header, animated form stack,
// and the cancel / confirm footer.

export function SessionDialogShell({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-[680px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_270px]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SessionDialogColumn({
  title,
  description,
  submitLabel,
  onSubmit,
  onCancel,
  isPending,
  children,
}: {
  title: string
  description: string
  submitLabel: string
  onSubmit: () => void
  onCancel: () => void
  isPending: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col">
      <DialogHeader className="border-b px-6 pb-4 pt-5 text-left">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <AnimatedStack className="flex flex-col gap-5 px-6 py-5">
        {children}
      </AnimatedStack>

      <DialogFooter className="flex justify-end gap-2 border-t px-6 py-4">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Annulla
        </Button>
        <Button onClick={onSubmit} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )
}
