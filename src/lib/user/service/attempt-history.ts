import { getDb } from "@/db";
import { findCompletedAttemptHistory } from "@/lib/quiz/db/attempts";

import type { MasteryScope } from "../schemas";
import type { AttemptHistoryEntry } from "../types";

export async function getAttemptHistory(
	userId: string,
	scope?: MasteryScope
): Promise<AttemptHistoryEntry[]> {
	const rows = await findCompletedAttemptHistory(getDb(), userId, scope);
	return rows.map(row => ({ ...row, completedAt: row.completedAt! }));
}
