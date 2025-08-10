import { prisma } from "@/lib/prisma";

export class EvaluationService {
	/**
	 * Ottieni tutte le modalità di valutazione
	 */
	static async getAllEvaluationModes() {
		return await prisma.evaluationMode.findMany({
			orderBy: { name: "asc" },
		});
	}

	/**
	 * Ottieni una modalità di valutazione per ID
	 */
	static async getEvaluationModeById(id: string) {
		return await prisma.evaluationMode.findUnique({
			where: { id },
		});
	}
}
