import type { EvaluationMode } from "@/lib/quiz/types";

// Seeded into ["quiz", "evaluation-modes"] by the session dialog stories. Fixed ids and no randomness:
// a story that reshuffles is useless for comparing two variants.
export const EVAL_MODES: EvaluationMode[] = [
	{
		id: "mode-standard",
		name: "Standard",
		description: "Un punto per risposta corretta, nessuna penalità.",
		correctAnswerPoints: 1,
		incorrectAnswerPoints: 0,
		partialCreditEnabled: false,
	},
	{
		id: "mode-penalty",
		name: "Con penalità",
		description: "Un punto per la corretta, meno un terzo per la sbagliata.",
		correctAnswerPoints: 1,
		incorrectAnswerPoints: -0.33,
		partialCreditEnabled: false,
	},
	{
		id: "mode-partial",
		name: "Credito parziale",
		description: "Le risposte multiple valgono in proporzione alle scelte giuste.",
		correctAnswerPoints: 1,
		incorrectAnswerPoints: 0,
		partialCreditEnabled: true,
	},
];

export const EVAL_MODES_SEED: [unknown[], unknown][] = [
	[["quiz", "evaluation-modes"], EVAL_MODES],
];
