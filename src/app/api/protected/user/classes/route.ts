import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

// GET /api/protected/user/classes
export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const savedClasses = await UserService.getUserSavedClasses(userId);

		return NextResponse.json(savedClasses);
	} catch (error) {
		console.error("Error fetching saved classes:", error);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
});

// POST /api/protected/userClass - Aggiungi una classe alla lista preferiti
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
		const { classId } = body;

		if (!classId || typeof classId !== "string") {
			return NextResponse.json(
				{ error: "classId is required and must be a string" },
				{ status: 400 }
			);
		}

		const savedClass = await UserService.addClassToUserList(userId, classId);

		return NextResponse.json(
			{
				message: "Class added to your list successfully",
				savedClass,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error adding class to user list:", error);

		if (error instanceof Error) {
			// Errori specifici del business logic
			if (
				error.message === "Classe non trovata" ||
				error.message === "Utente non trovato"
			) {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (error.message === "La classe è già nella tua lista") {
				return NextResponse.json({ error: error.message }, { status: 409 });
			}
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
});

// DELETE /api/protected/userClass?classId=123 - Rimuovi una classe dalla lista preferiti
export const DELETE = auth(async function DELETE(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const { searchParams } = new URL(request.url);
		const classId = searchParams.get("classId");

		if (!classId) {
			return NextResponse.json(
				{ error: "classId query parameter is required" },
				{ status: 400 }
			);
		}

		const result = await UserService.removeClassFromUserList(userId, classId);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error removing class from user list:", error);

		if (error instanceof Error && error.message === "La classe non è nella tua lista") {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
});
