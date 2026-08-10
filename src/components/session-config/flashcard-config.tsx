import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";

import { AnimatedBlock } from "./animated-block";
import { SliderWithInput } from "./session-form-blocks";
import { CardStackBlock, Eyebrow } from "./summary-blocks";

// The flashcard configuration form and its live summary, shared by the flashcard
// start dialog and the exam dialog's flashcard tab. State lives in the parent.

export function FlashcardConfigFields({
	cardCount,
	setCardCount,
	maxCards,
}: {
	cardCount: number;
	setCardCount: (v: number) => void;
	maxCards: number;
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
				<div className="bg-muted/50 text-muted-foreground flex gap-2 rounded-lg p-3 text-xs">
					<InfoCircleIcon className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
					<p className="leading-relaxed">
						Modalità studio libero. Gira la carta, valuta la tua confidenza con{" "}
						<span className="text-foreground font-semibold">Sapevo</span> /{" "}
						<span className="text-foreground font-semibold">Non sapevo</span>. Nessun
						timer, nessun punteggio.
					</p>
				</div>
			</AnimatedBlock>
		</>
	);
}

export function FlashcardSummary({
	cardCount,
	maxCards,
}: {
	cardCount: number;
	maxCards: number;
}) {
	return (
		<>
			<AnimatedBlock>
				<CardStackBlock count={cardCount} max={maxCards} />
			</AnimatedBlock>
			<AnimatedBlock>
				<div className="flex flex-col gap-1">
					<Eyebrow>Modalità</Eyebrow>
					<div className="text-foreground text-sm font-semibold">Studio libero</div>
					<p className="text-muted-foreground text-xs leading-relaxed">
						Gira, valuta, ripeti. Senza tempo né penalità.
					</p>
				</div>
			</AnimatedBlock>
		</>
	);
}
