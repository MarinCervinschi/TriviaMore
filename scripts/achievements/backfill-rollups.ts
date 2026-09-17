// Rebuilds every user rollup from the history that is their source of truth.
// Run it once after applying 0028, and again any time the incremental path has
// been bypassed — a bulk import, a manual fix, a release that changed a rule.
// Idempotent: every statement is an upsert, so a rebuild converges.
//
//   pnpm achievements:backfill
import { closeDb, getDb } from "../../src/db/index.ts";
import { backfillRollups } from "../../src/lib/achievements/db/backfill.ts";

const started = Date.now();
await backfillRollups(getDb());

console.log(`rollup ricostruiti in ${Math.round((Date.now() - started) / 1000)}s`);

await closeDb();
