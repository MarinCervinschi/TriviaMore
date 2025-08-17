import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { FlashcardService } from "@/lib/services";

// GET /api/protected/flashcard - Recupera una sessione di flashcard per un utente autenticato
export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const url = new URL(request.url);
		const sessionId = url.searchParams.get("sessionId");

		if (!sessionId) {
			return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
		}

		// Determina se è una sessione di simulazione d'esame o normale
		const isExamSimulation = sessionId.startsWith("exam-flashcard-");

		const result = isExamSimulation
			? await FlashcardService.getExamSimulationSession(userId, sessionId)
			: await FlashcardService.getUserFlashcardSession(userId, sessionId);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching flashcard session:", error);

		if (error instanceof Error) {
			if (
				error.message === "Sezione non trovata o accesso negato" ||
				error.message === "Classe non trovata" ||
				error.message === "Sessione non valida"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
