import { Info } from "lucide-react"

import { AnimatedBlock } from "./animated-block"
import { SliderWithInput } from "./session-form-blocks"
import { CardStackBlock, Eyebrow } from "./summary-blocks"

// The flashcard configuration form and its live summary, shared by the flashcard
// start dialog and the exam dialog's flashcard tab. State lives in the parent.

export function FlashcardConfigFields({
  cardCount,
  setCardCount,
  maxCards,
}: {
  cardCount: number
  setCardCount: (v: number) => void
  maxCards: number
}) {
  return (
    <>
      <AnimatedBlock>
        <SliderWithInput
          label="Numero di carte"
          value={cardCount}
          onChange={setCardCount}
          min={1}
          max={maxCards}
          hint={
            cardCount === maxCards
              ? `Tutte (${maxCards})`
              : `${cardCount} di ${maxCards}`
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
            Modalità studio libero. Gira la carta, valuta la tua confidenza con{" "}
            <span className="font-semibold text-foreground">Sapevo</span> /{" "}
            <span className="font-semibold text-foreground">Non sapevo</span>.
            Nessun timer, nessun punteggio.
          </p>
        </div>
      </AnimatedBlock>
    </>
  )
}

export function FlashcardSummary({
  cardCount,
  maxCards,
}: {
  cardCount: number
  maxCards: number
}) {
  return (
    <>
      <AnimatedBlock>
        <CardStackBlock count={cardCount} max={maxCards} />
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
    </>
  )
}
