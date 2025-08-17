import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { QuizService } from "@/lib/services";

// POST /api/protected/quiz/complete - Completa un quiz e salva i risultati
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
		const { quizAttemptId, answers, totalScore, timeSpent } = body;

		if (!quizAttemptId || typeof quizAttemptId !== "string") {
			return NextResponse.json(
				{ error: "quizAttemptId is required and must be a string" },
				{ status: 400 }
			);
		}

		if (!Array.isArray(answers)) {
			return NextResponse.json(
				{ error: "answers is required and must be an array" },
				{ status: 400 }
			);
		}

		if (typeof timeSpent !== "number" || timeSpent < 0) {
			return NextResponse.json(
				{ error: "timeSpent is required and must be a non-negative number" },
				{ status: 400 }
			);
		}

		for (const answer of answers) {
			if (!answer.questionId || typeof answer.questionId !== "string") {
				return NextResponse.json(
					{ error: "Each answer must have a valid questionId" },
					{ status: 400 }
				);
			}

			if (!Array.isArray(answer.userAnswer)) {
				return NextResponse.json(
					{ error: "Each answer must have userAnswer as an array" },
					{ status: 400 }
				);
			}

			if (typeof answer.score !== "number") {
				return NextResponse.json(
					{ error: "Each answer must have a numeric score" },
					{ status: 400 }
				);
			}
		}

		await QuizService.completeQuiz({
			userId,
			quizAttemptId,
			answers,
			totalScore,
			timeSpent,
		});

		return NextResponse.json(null, {
			status: 200,
			headers: {
				Location: `/quiz/results/${quizAttemptId}`,
			},
		});
	} catch (error) {
		console.error("Error completing quiz:", error);

		if (error instanceof Error) {
			if (
				error.message === "Quiz attempt non trovato" ||
				error.message === "Quiz attempt non appartiene all'utente"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (error.message === "Quiz già completato") {
				return NextResponse.json({ error: error.message }, { status: 409 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
