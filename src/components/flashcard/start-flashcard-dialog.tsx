import { useState } from "react"
import { Info } from "lucide-react"

import { AnimatedBlock } from "@/components/session-config/animated-block"
import {
  SessionDialogColumn,
  SessionDialogShell,
} from "@/components/session-config/session-dialog"
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
    <SessionDialogShell open={open} onOpenChange={onOpenChange}>
      <SessionDialogColumn
        title="Configura Flashcard"
        description="Scegli quante carte vuoi studiare"
        submitLabel="Inizia Flashcard"
        onSubmit={() =>
          mutation.mutate({
            sectionId,
            cardCount: Math.min(cardCount, maxQuestions),
          })
        }
        onCancel={() => onOpenChange(false)}
        isPending={mutation.isPending}
      >
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
              Modalità studio libero. Gira la carta, valuta la tua confidenza
              con{" "}
              <span className="font-semibold text-foreground">Sapevo</span> /{" "}
              <span className="font-semibold text-foreground">Non sapevo</span>.
              Nessun timer, nessun punteggio.
            </p>
          </div>
        </AnimatedBlock>
      </SessionDialogColumn>

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
    </SessionDialogShell>
  )
}
