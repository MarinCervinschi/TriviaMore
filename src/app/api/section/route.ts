import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth/lib";

import { auth } from "@/lib/auth";
import { BrowseService, EvaluationService, UserService } from "@/lib/services";

// GET /api/section?departmentCode=<departmentCode>&courseCode=<courseCode>&classCode=<classCode>&sectionName=<sectionName>
export const GET = auth(async function GET(request: NextAuthRequest) {
	try {
		const userId = request.auth?.user?.id;

		const { searchParams } = new URL(request.url);
		const departmentCode = searchParams.get("departmentCode");
		const courseCode = searchParams.get("courseCode");
		const classCode = searchParams.get("classCode");
		const sectionName = searchParams.get("sectionName");

		if (!departmentCode || !courseCode || !classCode || !sectionName) {
			return NextResponse.json(
				{ error: "Missing required query parameters" },
				{ status: 400 }
			);
		}

		const [sectionData, evaluationModes] = await Promise.all([
			BrowseService.getSectionByName(
				departmentCode,
				courseCode,
				classCode,
				sectionName,
				userId
			),
			EvaluationService.getAllEvaluationModes(),
		]);

		return NextResponse.json({ sectionData, evaluationModes });
	} catch (error) {
		console.error("Error fetching section data:", error);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
