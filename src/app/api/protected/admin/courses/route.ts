import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { AdminService } from "@/lib/services/admin.service";

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
		const { name, code, description, departmentId, courseType, position } = body;

		if (!name || !code || !departmentId || !courseType) {
			return NextResponse.json(
				{ error: "Nome, codice, dipartimento e tipo corso sono obbligatori" },
				{ status: 400 }
			);
		}

		const course = await AdminService.createCourse(userId, {
			name,
			code,
			description,
			departmentId,
			courseType,
			position,
		});

		return NextResponse.json(course, { status: 201 });
	} catch (error) {
		console.error("Error creating course:", error);

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
