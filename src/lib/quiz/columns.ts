import { evaluationModes } from "@/db/schema";

export const evaluationModeColumns = {
	id: evaluationModes.id,
	name: evaluationModes.name,
	description: evaluationModes.description,
	correctAnswerPoints: evaluationModes.correctAnswerPoints,
	incorrectAnswerPoints: evaluationModes.incorrectAnswerPoints,
	partialCreditEnabled: evaluationModes.partialCreditEnabled,
};
