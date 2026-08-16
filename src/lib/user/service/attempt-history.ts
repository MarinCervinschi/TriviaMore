import { getDb } from "@/db";
import { findCompletedAttemptHistory } from "@/lib/quiz/db/attempts";

import type { AttemptHistoryEntry } from "../types";

export async function getAttemptHistory(
	userId: string
): Promise<AttemptHistoryEntry[]> {
	const rows = await findCompletedAttemptHistory(getDb(), userId);
	return rows.map(row => ({ ...row, completedAt: row.completedAt! }));
}
