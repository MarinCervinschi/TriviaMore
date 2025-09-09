import { NextResponse } from "next/server";

import { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// api/protected/admin/section/access
export const POST = auth(async function POST(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const role = request.auth.user?.role;
		if (role !== "ADMIN" && role !== "SUPERADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { userId, sectionId } = await request.json();
		if (!userId || !sectionId) {
			return NextResponse.json(
				{ error: "userId e sectionId sono richiesti" },
				{ status: 400 }
			);
		}

		const access = await prisma.sectionAccess.create({
			data: { userId, sectionId },
		});
		return NextResponse.json(access, { status: 201 });
	} catch (error) {
		console.error("Error creating access:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
});

// api/protected/admin/section/access
export const DELETE = auth(async function DELETE(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const role = request.auth.user?.role;
		if (role !== "ADMIN" && role !== "SUPERADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { userId, sectionId } = await request.json();
		if (!userId || !sectionId) {
			return NextResponse.json(
				{ error: "userId e sectionId sono richiesti" },
				{ status: 400 }
			);
		}

		await prisma.sectionAccess.delete({
			where: { userId_sectionId: { userId, sectionId } },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting access:", error);

		return NextResponse.json(
			{ error: "Errore nella cancellazione", details: error },
			{ status: 500 }
		);
	}
});
