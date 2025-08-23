import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services";

// GET /api/protected/user/sections-access?courseId=<courseId>
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
		const courseId = searchParams.get("courseId");
		const classId = searchParams.get("classId");

		if (!courseId && !classId) {
			return NextResponse.json(
				{ error: "Course ID or Class ID not found" },
				{ status: 400 }
			);
		}

		let result;

		if (classId) {
			result = await UserService.getUserSectionsAccess(userId, classId);
		} else if (courseId) {
			result = await UserService.countUserSectionsAccessByCourse(userId, courseId);
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching user sections access:", error);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
