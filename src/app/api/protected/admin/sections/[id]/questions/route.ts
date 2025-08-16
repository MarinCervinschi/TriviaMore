import { type NextRequest, NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async function GET(
	request: NextAuthRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const { id: sectionId } = await params;

		// Get all questions for this section
		const questions = await prisma.question.findMany({
			where: {
				sectionId: sectionId,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				sectionId: true,
				content: true,
				questionType: true,
				options: true,
				correctAnswer: true,
				explanation: true,
				difficulty: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						bookmarks: true,
						quizQuestions: true,
						answerAttempts: true,
					},
				},
			},
		});

		return NextResponse.json(questions);
	} catch (error) {
		console.error("Error fetching section questions:", error);
		return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
