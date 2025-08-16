import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { AdminService } from "@/lib/services/admin.service";
import {
	ClassBody,
	CourseBody,
	DepartmentBody,
	NodeType,
	QuestionBody,
	SectionBody,
} from "@/lib/types/crud.types";

// api/protected/admin/crud/[id]?nodeType

export const PUT = auth(async function PUT(
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

		const { searchParams } = new URL(request.url);
		const nodeType = searchParams.get("nodeType") as NodeType | null;

		if (nodeType === null) {
			return NextResponse.json({ error: "Node type not found" }, { status: 400 });
		}

		const { id } = await params;
		const body = await request.json();

		switch (nodeType) {
			case "department":
				await AdminService.updateDepartment(userId, id, body as DepartmentBody);
				break;
			case "course":
				await AdminService.updateCourse(userId, id, body as CourseBody);
				break;
			case "class":
				await AdminService.updateClass(userId, id, body as ClassBody);
				break;
			case "section":
				await AdminService.updateSection(userId, id, body as SectionBody);
				break;
			case "question":
				await AdminService.updateQuestion(userId, id, body as QuestionBody);
				break;
			default:
				return NextResponse.json({ error: "Invalid node type" }, { status: 400 });
		}

		return new NextResponse(undefined, { status: 204 });
	} catch (error) {
		console.error("Error updating course:", error);

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
}) as unknown as (request: NextAuthRequest, context: any) => Promise<NextResponse>;

export const DELETE = auth(async function DELETE(
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

		const { searchParams } = new URL(request.url);
		const nodeType = searchParams.get("nodeType") as NodeType | null;

		if (nodeType === null) {
			return NextResponse.json({ error: "Node type not found" }, { status: 400 });
		}

		const { id } = await params;

		switch (nodeType) {
			case "department":
				await AdminService.deleteDepartment(userId, id);
				break;
			case "course":
				await AdminService.deleteCourse(userId, id);
				break;
			case "class":
				await AdminService.deleteClass(userId, id);
				break;
			case "section":
				await AdminService.deleteSection(userId, id);
				break;
			case "question":
				await AdminService.deleteQuestion(userId, id);
				break;
			default:
				return NextResponse.json({ error: "Invalid node type" }, { status: 400 });
		}

		return new NextResponse(undefined, { status: 204 });
	} catch (error) {
		console.error("Error deleting course:", error);

		if (error instanceof Error) {
			if (error.message.includes("permessi") || error.message.includes("permission")) {
				return NextResponse.json({ error: error.message }, { status: 403 });
			}

			if (error.message.includes("contiene") || error.message.includes("contains")) {
				return NextResponse.json({ error: error.message }, { status: 409 });
			}
		}

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}) as unknown as (request: NextAuthRequest, context: any) => Promise<NextResponse>;
