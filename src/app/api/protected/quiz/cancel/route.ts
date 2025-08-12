import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { QuizService } from "@/lib/services/quiz.service";

// DELETE /api/protected/quiz/cancel - Cancella un quiz in corso per un utente autenticato
export const DELETE = auth(async function DELETE(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const body = await request.json();
		const { quizAttemptId } = body;

		if (!quizAttemptId || typeof quizAttemptId !== "string") {
			return NextResponse.json(
				{ error: "quizAttemptId is required and must be a string" },
				{ status: 400 }
			);
		}

		await QuizService.cancelQuiz(quizAttemptId, userId);

		return NextResponse.json(
			{ message: "Quiz cancelled successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error cancelling quiz:", error);

		if (error instanceof Error) {
			if (
				error.message === "Quiz attempt non trovato" ||
				error.message === "Quiz attempt non appartiene all'utente"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (error.message === "Quiz già completato") {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
