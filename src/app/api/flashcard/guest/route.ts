import { NextResponse } from "next/server";

import { FlashcardService } from "@/lib/services/flashcard.service";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { sectionId, cardCount = 10 } = body;

		if (!sectionId || typeof sectionId !== "string") {
			return NextResponse.json(
				{ error: "sectionId è richiesto e deve essere una stringa" },
				{ status: 400 }
			);
		}

		if (cardCount && (typeof cardCount !== "number" || cardCount <= 0)) {
			return NextResponse.json(
				{ error: "cardCount deve essere un numero positivo" },
				{ status: 400 }
			);
		}

		const result = await FlashcardService.generateGuestFlashcardSession({
			sectionId,
			cardCount,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Errore nella generazione delle flashcard guest:", error);

		if (error instanceof Error) {
			if (
				error.message ===
				"Sezione non trovata o nessuna domanda disponibile per le flashcard"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Errore interno del server" },
			{ status: 500 }
		);
	}
}
