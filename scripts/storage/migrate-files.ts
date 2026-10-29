// Copies Supabase Storage's three buckets to S3 and points the profile pictures at S3_PUBLIC_URL; without --apply it writes nothing.
import { createClient } from "@supabase/supabase-js";
import { AwsClient } from "aws4fetch";
import pg from "pg";

function env(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

const apply = process.argv.includes("--apply");
const supabaseUrl = env("VITE_SUPABASE_URL").replace(/\/$/, "");
const supabase = createClient(supabaseUrl, env("SUPABASE_SERVICE_ROLE_KEY"));
const s3 = new AwsClient({
	accessKeyId: env("S3_ACCESS_KEY_ID"),
	secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
	region: env("S3_REGION"),
	service: "s3",
});
const endpoint = env("S3_ENDPOINT").replace(/\/$/, "");
const publicBase = `${env("S3_PUBLIC_URL").replace(/\/$/, "")}/`;
const supabaseBase = `${supabaseUrl}/storage/v1/object/public/`;

// The public bucket keeps the old bucket names as prefixes, so a URL keeps its path (src/lib/avatar/service.ts).
const SOURCES = [
	{ from: "avatars", to: env("S3_BUCKET_PUBLIC"), prefix: "avatars/" },
	{ from: "avatar-uploads", to: env("S3_BUCKET_PUBLIC"), prefix: "avatar-uploads/" },
	{ from: "contributions", to: env("S3_BUCKET_CONTRIBUTIONS"), prefix: "" },
];

function objectUrl(bucket: string, key: string): string {
	return `${endpoint}/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function listFiles(
	bucket: string,
	folder = ""
): Promise<{ path: string; type: string }[]> {
	const files: { path: string; type: string }[] = [];
	for (let offset = 0; ; offset += 1000) {
		const { data, error } = await supabase.storage
			.from(bucket)
			.list(folder, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
		if (error) throw new Error(`${bucket}/${folder}: ${error.message}`);
		for (const entry of data) {
			const path = folder ? `${folder}/${entry.name}` : entry.name;
			// A folder has no id in Supabase's listing.
			if (entry.id === null) files.push(...(await listFiles(bucket, path)));
			else
				files.push({
					path,
					type: String(entry.metadata?.mimetype ?? "application/octet-stream"),
				});
		}
		if (data.length < 1000) return files;
	}
}

console.log(`Supabase: ${new URL(supabaseUrl).host}  →  S3: ${new URL(endpoint).host}`);

const copied = new Set<string>();
let missingInS3 = 0;
for (const source of SOURCES) {
	const files = await listFiles(source.from);
	let present = 0;
	let written = 0;
	for (const file of files) {
		const key = `${source.prefix}${file.path}`;
		copied.add(key);
		const head = await s3.fetch(objectUrl(source.to, key), { method: "HEAD" });
		if (head.ok) {
			present += 1;
			continue;
		}
		if (head.status !== 404) throw new Error(`HEAD ${key}: ${head.status}`);
		missingInS3 += 1;
		if (!apply) continue;

		const { data, error } = await supabase.storage
			.from(source.from)
			.download(file.path);
		if (error || !data)
			throw new Error(`download ${source.from}/${file.path}: ${error?.message}`);
		const put = await s3.fetch(objectUrl(source.to, key), {
			method: "PUT",
			body: new Uint8Array(await data.arrayBuffer()),
			headers: { "content-type": file.type },
		});
		if (!put.ok) throw new Error(`PUT ${key}: ${put.status} ${await put.text()}`);
		written += 1;
	}
	console.log(
		`${source.from.padEnd(16)} ${files.length} file → ${source.to}/${source.prefix}  (${present} già presenti, ${apply ? `${written} copiati` : `${files.length - present} da copiare`})`
	);
}

const client = new pg.Client({ connectionString: env("SUPABASE_DB_URL"), ssl: false });
await client.connect();
await client.query("begin");
try {
	const { rows: existing } = await client.query<{ table_name: string }>(
		`select table_name from information_schema.tables where table_schema = 'public' and table_name in ('profiles', 'users')`
	);
	// users arrives with Better Auth (migration 0001), so before it only profiles holds pictures.
	for (const table of ["profiles", "users"].filter(name =>
		existing.some(row => row.table_name === name)
	)) {
		const { rows } = await client.query<{ image: string }>(
			`select image from public.${table} where starts_with(image, $1)`,
			[supabaseBase]
		);
		const dangling = rows.filter(
			row => !copied.has(decodeURIComponent(row.image.slice(supabaseBase.length)))
		);
		const updated = await client.query(
			`update public.${table} set image = $2 || substr(image, length($1) + 1) where starts_with(image, $1)`,
			[supabaseBase, publicBase]
		);
		console.log(
			`public.${table.padEnd(9)} ${updated.rowCount} immagini riscritte${dangling.length ? `, ${dangling.length} puntano a file che Supabase non ha` : ""}`
		);
	}

	if (apply) {
		await client.query("commit");
		console.log("\nApplicato. Un secondo giro non copia né riscrive nulla.");
	} else {
		await client.query("rollback");
		console.log(
			`\nProva a vuoto${missingInS3 ? `, ${missingInS3} file da copiare` : ""}: nulla è stato scritto. Per scrivere: aggiungi --apply.`
		);
	}
} catch (error) {
	await client.query("rollback");
	throw error;
} finally {
	await client.end();
}
