import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { AdminService } from "@/lib/services/admin.service";

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

		const { id } = await params;
		const body = await request.json();
		const { name, code, description, courseType, position } = body;

		const course = await AdminService.updateCourse(userId, id, {
			name,
			code,
			description,
			courseType,
			position,
		});

		return NextResponse.json(course);
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

		const { id } = await params;

		await AdminService.deleteCourse(userId, id);

		return NextResponse.json({ success: true });
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
