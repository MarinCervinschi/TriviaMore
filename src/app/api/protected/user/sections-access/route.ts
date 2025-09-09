import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

// GET /api/protected/user/sections-access?classId=<classId>
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
		const classId = searchParams.get("classId");

		if (!classId) {
			return NextResponse.json({ error: "Class ID required" }, { status: 400 });
		}

		const result = await UserService.getUserSectionsAccess(userId, classId);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching user sections access:", error);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
});
