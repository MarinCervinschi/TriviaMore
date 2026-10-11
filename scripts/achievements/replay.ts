import { closeDb } from "../../src/db/index.ts";
import { replayAchievements } from "../../src/lib/achievements/service.ts";

const dryRun = process.argv.includes("--dry-run");
const notify = process.argv.includes("--notify");

const result = await replayAchievements({ dryRun, notify });

console.log(
	dryRun
		? `dry run — ${result.users} utenti, ${result.awarded} traguardi da assegnare`
		: `${result.users} utenti, ${result.awarded} traguardi assegnati${notify ? " e notificati" : ""}`
);

await closeDb();
