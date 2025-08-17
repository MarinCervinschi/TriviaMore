import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { AdminService } from "@/lib/services/admin.service";
import { QuestionBody } from "@/lib/types/crud.types";

// api/protected/admin/crud/questions?sectionId=string

export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}
		const { searchParams } = new URL(request.url);
		const sectionId = searchParams.get("sectionId");
		if (!sectionId) {
			return NextResponse.json({ error: "Section ID not found" }, { status: 400 });
		}

		const questions = await AdminService.getQuestionsBySectionId(sectionId);

		return NextResponse.json(questions);
	} catch (error) {
		return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;

// api/protected/admin/crud/questions?JSON=boolean

export const POST = auth(async function POST(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;
		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const { searchParams } = new URL(request.url);
		const many = searchParams.get("JSON") === "true";

		if (many) {
			const body = (await request.json()) as QuestionBody[];
			await AdminService.createQuestions(userId, body);

			return NextResponse.json(null, { status: 201 });
		}

		const body = (await request.json()) as QuestionBody;
		await AdminService.createQuestion(userId, body);

		return NextResponse.json(null, { status: 201 });
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
