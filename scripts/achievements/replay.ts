// Awards every achievement every user has already earned. Run it once before the
// feature goes live, and again after adding a badge — a rule added today has to
// reach the people who met it months ago, or the catalogue reads as broken.
//
//   pnpm achievements:replay --dry-run    count what would be awarded
//   pnpm achievements:replay              award it, silently
//   pnpm achievements:replay --notify     award it and notify (rarely what you want)
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
