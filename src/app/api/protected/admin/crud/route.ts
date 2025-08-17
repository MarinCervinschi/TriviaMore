import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { AdminService } from "@/lib/services/admin.service";
import {
	ClassBody,
	CourseBody,
	DepartmentBody,
	NodeType,
	SectionBody,
} from "@/lib/types/crud.types";

// /api/protected/admin/crud?nodeType=kind

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
		const nodeType = searchParams.get("nodeType") as NodeType | null;

		if (nodeType === null) {
			return NextResponse.json({ error: "Node type not found" }, { status: 400 });
		}

		const body = await request.json();

		switch (nodeType) {
			case "department":
				await AdminService.createDepartment(userId, body as DepartmentBody);
				break;
			case "course":
				await AdminService.createCourse(userId, body as CourseBody);
				break;
			case "class":
				await AdminService.createClass(userId, body as ClassBody);
				break;
			case "section":
				await AdminService.createSection(userId, body as SectionBody);
				break;
			default:
				return NextResponse.json({ error: "Invalid node type" }, { status: 400 });
		}

		return NextResponse.json(null, { status: 201 });
	} catch (error) {
		console.error("Error creating class:", error);

		if (error instanceof Error) {
			if (error.message.includes("permessi") || error.message.includes("permission")) {
				return NextResponse.json({ error: error.message }, { status: 403 });
			}

			if (
				error.message.includes("esiste già") ||
				error.message.includes("already exists")
			) {
				return NextResponse.json({ error: error.message }, { status: 409 });
			}
		}

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;
