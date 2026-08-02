import { desc, eq } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { legalAcceptances } from "@/db/schema"

// Shared by the guard and by the status endpoint. The table is append-only, so
// the most recent row per document type is the accepted version.
export async function findLatestAcceptedVersions(
  db: DbOrTx,
  userId: string,
): Promise<Map<string, string>> {
  const rows = await db
    .select({
      documentType: legalAcceptances.documentType,
      version: legalAcceptances.version,
    })
    .from(legalAcceptances)
    .where(eq(legalAcceptances.userId, userId))
    .orderBy(desc(legalAcceptances.acceptedAt))

  const latest = new Map<string, string>()
  for (const row of rows) {
    if (!latest.has(row.documentType)) latest.set(row.documentType, row.version)
  }
  return latest
}
