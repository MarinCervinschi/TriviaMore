import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

// api/protected/user/progress

export const GET = auth(async function GET(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;

		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const userProgress = await UserService.getUserProgressData(userId);

		return NextResponse.json(userProgress);
	} catch (error) {
		console.error("Error fetching user progress]:", error);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
});
