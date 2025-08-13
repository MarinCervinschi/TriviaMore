import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { BookmarkService } from "@/lib/services/bookmark.service";

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const questionId = searchParams.get("questionId");

		if (!questionId) {
			return NextResponse.json({ error: "ID domanda richiesto" }, { status: 400 });
		}

		const result = await BookmarkService.checkBookmark(session.user.id, questionId);

		return NextResponse.json({
			bookmarked: result.isBookmarked,
		});
	} catch (error) {
		console.error("Errore verifica bookmark:", error);
		return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
	}
}
