import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { QuizService } from "@/lib/services";

export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;
		const { searchParams } = new URL(request.url);
		const quizId = searchParams.get("quizId");

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		if (!quizId) {
			return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
		}

		const result = await QuizService.getUserQuiz(userId, quizId);

		if (!result) {
			return NextResponse.json(
				{ error: "Quiz not found or access denied" },
				{ status: 404 }
			);
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching user quiz:", error);

		if (error instanceof Error) {
			if (
				error.message === "Quiz attempt non trovato" ||
				error.message === "Quiz not found or access denied"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (
				error.message === "Quiz attempt non appartiene all'utente" ||
				error.message === "Access denied"
			) {
				return NextResponse.json({ error: "Access denied" }, { status: 403 });
			}

			if (
				error.message.includes("required") ||
				error.message.includes("invalid") ||
				error.message.includes("malformed")
			) {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
