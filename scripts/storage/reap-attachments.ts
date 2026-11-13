import { closeDb } from "../../src/db/index.ts";
import { reapOrphanAttachments } from "../../src/lib/requests/service/attachments.ts";

const apply = process.argv.includes("--apply");
const { scanned, orphans } = await reapOrphanAttachments({ dryRun: !apply });

const bytes = orphans.reduce((total, object) => total + object.size, 0);
console.log(
	`${scanned} allegati, ${orphans.length} senza richiesta (${(bytes / 1024 / 1024).toFixed(1)} MB)`
);
for (const object of orphans.slice(0, 50)) {
	console.log(
		`  ${object.key}  ${object.lastModified.toISOString()}  ${object.size} B`
	);
}
if (orphans.length > 50) console.log(`  … e altri ${orphans.length - 50}`);
if (orphans.length > 0)
	console.log(apply ? "cancellati" : "esegui con --apply per cancellarli");

await closeDb();
