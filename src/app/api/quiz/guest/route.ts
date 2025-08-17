import { NextRequest, NextResponse } from "next/server";

import { QuizService } from "@/lib/services";

// http://localhost:3000/api/quiz/guest?sectionId=section-id

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const sectionId = searchParams.get("sectionId");
		const questionCount = searchParams.get("questionCount");
		const timeLimit = searchParams.get("timeLimit");

		if (!sectionId) {
			return NextResponse.json(
				{ error: "Il parametro sectionId è obbligatorio" },
				{ status: 400 }
			);
		}

		const params = {
			sectionId,
			questionCount: questionCount ? parseInt(questionCount) : 30,
			timeLimit: timeLimit ? parseInt(timeLimit) : 30,
		};

		const guestQuiz = await QuizService.generateGuestQuiz(params);

		return NextResponse.json(guestQuiz);
	} catch (error) {
		console.error("Errore nella generazione del quiz guest:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
	}
}
