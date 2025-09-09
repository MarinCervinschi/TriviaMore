import { NextResponse } from "next/server";

import type { NextAuthRequest } from "next-auth";

import { auth } from "@/lib/auth";

// /api/protected/admin/rebuild

export const POST = auth(async function POST(request: NextAuthRequest) {
	if (!request.auth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userId = request.auth.user?.id;
		if (!userId) {
			return NextResponse.json({ error: "User ID not found" }, { status: 400 });
		}

		const VERCEL_DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL;

		if (!VERCEL_DEPLOY_HOOK_URL) {
			return NextResponse.json(
				{ error: "Vercel deploy hook URL not found" },
				{ status: 500 }
			);
		}

		await fetch(VERCEL_DEPLOY_HOOK_URL, {
			method: "POST",
		});

		return new NextResponse(undefined, { status: 200 });
	} catch (error) {
		console.error("Error:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
});
