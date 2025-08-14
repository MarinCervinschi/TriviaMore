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
		const { name, code, description, position } = body;

		if (!name || !code) {
			return NextResponse.json(
				{ error: "Nome e codice sono obbligatori" },
				{ status: 400 }
			);
		}

		const department = await AdminService.createDepartment(userId, {
			name,
			code,
			description,
			position,
		});

		return NextResponse.json(department, { status: 201 });
	} catch (error) {
		console.error("Error creating department:", error);

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
