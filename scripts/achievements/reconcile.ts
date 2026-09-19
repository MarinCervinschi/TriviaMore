// Proves the rollups still agree with the history. Read-only unless asked:
// looking must never change what it is looking at.
//
//   pnpm achievements:reconcile            report the drift
//   pnpm achievements:reconcile --repair   report it, then rebuild
import { closeDb } from "../../src/db/index.ts";
import { reconcileAchievementMetrics } from "../../src/lib/achievements/service.ts";

const repair = process.argv.includes("--repair");
const { users, drift } = await reconcileAchievementMetrics({ repair });

if (drift.length === 0) {
	console.log(`${users} utenti, nessuna deriva`);
} else {
	const byUser = new Set(drift.map(entry => entry.userId)).size;
	console.log(
		`${users} utenti, ${drift.length} metriche derivate su ${byUser} utenti:`
	);
	for (const entry of drift.slice(0, 50)) {
		console.log(
			`  ${entry.userId}  ${entry.metric}  rollup=${entry.stored}  storia=${entry.computed}`
		);
	}
	if (drift.length > 50) console.log(`  … e altre ${drift.length - 50}`);
	console.log(repair ? "rollup ricostruiti" : "esegui con --repair per ricostruire");
}

await closeDb();
process.exitCode = drift.length > 0 && !repair ? 1 : 0;
