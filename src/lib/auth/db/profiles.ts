import { eq } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { profiles } from "@/db/schema"

export async function findProfile(db: DbOrTx, userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)
  return profile
}
