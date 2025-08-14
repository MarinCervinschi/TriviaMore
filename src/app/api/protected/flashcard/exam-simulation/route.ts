import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { FlashcardService } from "@/lib/services";

// POST /api/protected/flashcard/exam-simulation - Avvia una simulazione d'esame con flashcard per una classe
export const POST = auth(async function POST(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const body = await request.json();
		const { classId, cardCount = 20 } = body;

		if (!classId || typeof classId !== "string") {
			return NextResponse.json(
				{ error: "classId is required and must be a string" },
				{ status: 400 }
			);
		}

		if (cardCount && (typeof cardCount !== "number" || cardCount <= 0)) {
			return NextResponse.json(
				{ error: "cardCount must be a positive number" },
				{ status: 400 }
			);
		}

		const { sessionId } = await FlashcardService.startExamSimulationSession({
			userId,
			classId,
			cardCount,
		});

		return NextResponse.json(null, {
			status: 201,
			headers: {
				Location: `/flashcard/${sessionId}`,
			},
		});
	} catch (error) {
		console.error("Error starting flashcard exam simulation:", error);

		if (error instanceof Error) {
			if (
				error.message === "Classe non trovata" ||
				error.message === "Utente non ha accesso alla classe"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (error.message === "Nessuna domanda disponibile per la simulazione") {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
