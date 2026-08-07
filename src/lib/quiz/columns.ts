import { evaluationModes } from "@/db/schema";

// Shared so the endpoint that lists modes and the service that embeds one in a
// quiz return the same shape, without the timestamps the client never uses.
export const evaluationModeColumns = {
	id: evaluationModes.id,
	name: evaluationModes.name,
	description: evaluationModes.description,
	correctAnswerPoints: evaluationModes.correctAnswerPoints,
	incorrectAnswerPoints: evaluationModes.incorrectAnswerPoints,
	partialCreditEnabled: evaluationModes.partialCreditEnabled,
};
