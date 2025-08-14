import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { AdminService } from "@/lib/services/admin.service";

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
			content,
			questionType,
			options,
			correctAnswer,
			explanation,
			difficulty,
			sectionId,
		} = body;

		if (!content || !questionType || !correctAnswer || !difficulty || !sectionId) {
			return NextResponse.json(
				{
					error:
						"Contenuto, tipo, risposta corretta, difficoltà e sezione sono obbligatori",
				},
				{ status: 400 }
			);
		}

		const question = await AdminService.createQuestion(userId, {
			content,
			questionType,
			options,
			correctAnswer,
			explanation,
			difficulty,
			sectionId,
		});

		return NextResponse.json(question, { status: 201 });
	} catch (error) {
		console.error("Error creating question:", error);

		if (error instanceof Error) {
			if (error.message.includes("permessi") || error.message.includes("permission")) {
				return NextResponse.json({ error: error.message }, { status: 403 });
			}
		}

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
