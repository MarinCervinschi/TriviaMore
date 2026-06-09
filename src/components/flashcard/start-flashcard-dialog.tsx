import { useState } from "react"
import { Info, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AnimatedBlock,
  AnimatedStack,
} from "@/components/session-config/animated-block"
import { SliderWithInput } from "@/components/session-config/session-form-blocks"
import { SummaryPanel } from "@/components/session-config/summary-panel"
import {
  CardStackBlock,
  Eyebrow,
} from "@/components/session-config/summary-blocks"
import { useStartFlashcard } from "@/lib/flashcard/mutations"

export function StartFlashcardDialog({
  open,
  onOpenChange,
  sectionId,
  maxQuestions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  maxQuestions: number
}) {
  const [cardCount, setCardCount] = useState(Math.min(20, maxQuestions))
  const mutation = useStartFlashcard(() => onOpenChange(false))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-[680px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_270px]">
          <div className="flex flex-col">
            <DialogHeader className="border-b px-6 pb-4 pt-5 text-left">
              <DialogTitle>Configura Flashcard</DialogTitle>
              <DialogDescription>
                Scegli quante carte vuoi studiare
              </DialogDescription>
            </DialogHeader>

            <AnimatedStack className="flex flex-col gap-5 px-6 py-5">
              <AnimatedBlock>
                <SliderWithInput
                  label="Numero di carte"
                  value={cardCount}
                  onChange={setCardCount}
                  min={1}
                  max={maxQuestions}
                  hint={
                    cardCount === maxQuestions
                      ? `Tutte (${maxQuestions})`
                      : `${cardCount} di ${maxQuestions}`
                  }
                />
              </AnimatedBlock>

              <AnimatedBlock>
                <div className="flex gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Info
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                    strokeWidth={1.75}
                  />
                  <p className="leading-relaxed">
                    Modalità studio libero. Gira la carta, valuta la tua
                    confidenza con{" "}
                    <span className="font-semibold text-foreground">
                      Sapevo
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-foreground">
                      Non sapevo
                    </span>
                    . Nessun timer, nessun punteggio.
                  </p>
                </div>
              </AnimatedBlock>
            </AnimatedStack>

            <DialogFooter className="flex justify-end gap-2 border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Annulla
              </Button>
              <Button
                onClick={() =>
                  mutation.mutate({
                    sectionId,
                    cardCount: Math.min(cardCount, maxQuestions),
                  })
                }
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Inizia Flashcard
              </Button>
            </DialogFooter>
          </div>

          <SummaryPanel footerTip="Le flashcard non vengono salvate come tentativo. Studia in pace.">
            <AnimatedBlock>
              <CardStackBlock count={cardCount} max={maxQuestions} />
            </AnimatedBlock>
            <AnimatedBlock>
              <div className="flex flex-col gap-1">
                <Eyebrow>Modalità</Eyebrow>
                <div className="text-[13px] font-semibold text-foreground">
                  Studio libero
                </div>
                <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                  Gira, valuta, ripeti. Senza tempo né penalità.
                </p>
              </div>
            </AnimatedBlock>
          </SummaryPanel>
        </div>
      </DialogContent>
    </Dialog>
  )
}
