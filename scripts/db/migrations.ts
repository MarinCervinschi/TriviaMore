// drizzle-kit 0.31 swallows the SQL error of a failing migration; this reads the same journal and says which statement broke.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

type Entry = { idx: number; when: number; tag: string };

const DIR = join(import.meta.dirname, "../../drizzle");
const url = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
if (!url)
	throw new Error(
		"Set SUPABASE_DB_URL to the admin (postgres) connection of the database."
	);

const apply = process.argv.includes("--apply");
const { entries } = JSON.parse(
	await readFile(join(DIR, "meta/_journal.json"), "utf8")
) as {
	entries: Entry[];
};

const client = new pg.Client({ connectionString: url, ssl: false });
await client.connect();

const { rows } = await client.query<{ created_at: string }>(
	"select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1"
);
// drizzle applies every migration newer than the last one recorded, by the journal's `when`.
const last = rows[0] ? Number(rows[0].created_at) : 0;
const pending = entries.filter(entry => entry.when > last);
const lastApplied = [...entries].reverse().find(entry => entry.when <= last);

console.log(`Database: ${new URL(url).host}${new URL(url).pathname}`);
console.log(`Ultima applicata: ${lastApplied ? lastApplied.tag : "nessuna"}`);
console.log(
	pending.length === 0
		? "Nessuna migration da applicare."
		: `Da applicare (${pending.length}):\n${pending.map(entry => `  ${entry.tag}`).join("\n")}`
);

if (apply) {
	for (const entry of pending) {
		const sql = await readFile(join(DIR, `${entry.tag}.sql`), "utf8");
		const statements = sql
			.split("--> statement-breakpoint")
			.map(statement => statement.trim())
			.filter(Boolean);
		console.log(`\n→ ${entry.tag} (${statements.length} istruzioni)`);
		await client.query("begin");
		try {
			for (const [index, statement] of statements.entries()) {
				try {
					await client.query(statement);
				} catch (error) {
					const failure = error as pg.DatabaseError;
					console.error(
						`\n✗ ${entry.tag}, istruzione ${index + 1} di ${statements.length}:`
					);
					console.error(
						statement.length > 600 ? `${statement.slice(0, 600)}…` : statement
					);
					console.error(
						`\n${failure.severity ?? "ERROR"} ${failure.code ?? ""}: ${failure.message}`
					);
					if (failure.detail) console.error(`Dettaglio: ${failure.detail}`);
					if (failure.hint) console.error(`Suggerimento: ${failure.hint}`);
					throw error;
				}
			}
			await client.query(
				"insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
				[createHash("sha256").update(sql).digest("hex"), entry.when]
			);
			await client.query("commit");
			console.log(`✓ ${entry.tag}`);
		} catch {
			await client.query("rollback");
			console.error(
				`\n${entry.tag} annullata per intero; le precedenti restano applicate.`
			);
			process.exitCode = 1;
			break;
		}
	}
} else if (pending.length > 0) {
	console.log(
		"\nPer applicarle, una per volta e con l'errore in chiaro: aggiungi --apply."
	);
}

await client.end();
