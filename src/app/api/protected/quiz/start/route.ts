import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { QuizService } from "@/lib/services/quiz.service";

// POST /api/protected/quiz/start - Avvia un quiz per un utente autenticato
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
		const {
			sectionId,
			questionCount = 30,
			timeLimit = 30,
			quizMode,
			evaluationModeId,
		} = body;

		// Validazione dei parametri richiesti
		if (!sectionId || typeof sectionId !== "string") {
			return NextResponse.json(
				{ error: "sectionId is required and must be a string" },
				{ status: 400 }
			);
		}

		if (!quizMode || !["STUDY", "EXAM_SIMULATION"].includes(quizMode)) {
			return NextResponse.json(
				{ error: "quizMode is required and must be STUDY or EXAM_SIMULATION" },
				{ status: 400 }
			);
		}

		if (!evaluationModeId || typeof evaluationModeId !== "string") {
			return NextResponse.json(
				{ error: "evaluationModeId is required and must be a string" },
				{ status: 400 }
			);
		}

		// Validazione parametri opzionali
		if (questionCount && (typeof questionCount !== "number" || questionCount <= 0)) {
			return NextResponse.json(
				{ error: "questionCount must be a positive number" },
				{ status: 400 }
			);
		}

		if (timeLimit && (typeof timeLimit !== "number" || timeLimit <= 0)) {
			return NextResponse.json(
				{ error: "timeLimit must be a positive number" },
				{ status: 400 }
			);
		}

		const quizAttempt = await QuizService.startQuiz({
			userId,
			sectionId,
			questionCount,
			timeLimit,
			quizMode,
			evaluationModeId,
		});

		// Restituisce i dati completi del quiz
		return NextResponse.json(
			{
				quizId: quizAttempt.quiz.id,
				attemptId: quizAttempt.attemptId,
				quiz: quizAttempt.quiz,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error starting quiz:", error);

		if (error instanceof Error) {
			// Errori specifici del business logic
			if (
				error.message === "Sezione non trovata" ||
				error.message === "Modalità di valutazione non trovata" ||
				error.message === "Utente non ha accesso alla sezione"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (error.message === "Nessuna domanda disponibile per il quiz") {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
