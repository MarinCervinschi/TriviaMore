import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

// api/protected/user/recent-classes

export const POST = auth(async function POST(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;
		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const { classId } = await request.json();
		if (!classId) {
			return NextResponse.json({ error: "Class ID not found" }, { status: 400 });
		}

		await UserService.updateUserRecentClass(userId, classId);

		return NextResponse.json(null, { status: 200 });
	} catch (error) {
		console.error("Error updating user recent class:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
