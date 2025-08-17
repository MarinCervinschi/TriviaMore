import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { BookmarkService } from "@/lib/services";

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
		}

		const { questionId } = await request.json();

		if (!questionId) {
			return NextResponse.json({ error: "ID domanda richiesto" }, { status: 400 });
		}

		const result = await BookmarkService.toggleBookmark(session.user.id, questionId);

		if (!result.success) {
			return NextResponse.json({ error: result.message }, { status: 500 });
		}

		return NextResponse.json({
			bookmarked: result.action === "added",
			message: result.message,
		});
	} catch (error) {
		console.error("Errore toggle bookmark:", error);
		return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
	}
}
