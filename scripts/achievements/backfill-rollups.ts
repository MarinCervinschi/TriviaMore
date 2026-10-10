import { closeDb, getDb } from "../../src/db/index.ts";
import { backfillRollups } from "../../src/lib/achievements/db/backfill.ts";

const started = Date.now();
await backfillRollups(getDb());

console.log(`rollup ricostruiti in ${Math.round((Date.now() - started) / 1000)}s`);

await closeDb();
