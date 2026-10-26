// Copies GoTrue's users and identities into the Better Auth tables, keeping every id; without --apply it rolls back.
import pg from "pg";

const url = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
if (!url)
	throw new Error(
		"Set SUPABASE_DB_URL to the admin (postgres) connection of the database."
	);

const apply = process.argv.includes("--apply");
const client = new pg.Client({ connectionString: url, ssl: false });
await client.connect();

async function count(sql: string): Promise<number> {
	const { rows } = await client.query<{ n: string }>(sql);
	return Number(rows[0]!.n);
}

const MIGRATED = `u.deleted_at is null and u.email is not null and not coalesce(u.is_anonymous, false)`;

console.log(`Database: ${new URL(url).host}${new URL(url).pathname}`);

const tables = await count(
	`select count(*) as n from information_schema.tables where table_schema = 'public' and table_name in ('users', 'accounts')`
);
if (tables < 2) {
	console.error(
		"Mancano public.users o public.accounts: applica prima la migration 0001."
	);
	process.exit(1);
}

// Two GoTrue users with the same address in a different case would break the unique email of users.
const duplicates = await count(
	`select count(*) as n from (select lower(email) from auth.users u where ${MIGRATED} group by lower(email) having count(*) > 1) d`
);
if (duplicates > 0) {
	console.error(
		`${duplicates} indirizzi compaiono su più utenti GoTrue: vanno risolti a mano prima.`
	);
	process.exit(1);
}

await client.query("begin");
try {
	const users = await client.query<{ inserted: boolean }>(`
		insert into public.users (id, name, email, email_verified, image, created_at, updated_at)
		select u.id,
		       coalesce(nullif(p.name, ''), u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
		       lower(u.email),
		       u.email_confirmed_at is not null,
		       coalesce(p.image, u.raw_user_meta_data->>'avatar_url'),
		       u.created_at,
		       coalesce(u.updated_at, u.created_at)
		  from auth.users u
		  left join public.profiles p on p.id = u.id
		 where ${MIGRATED}
		on conflict (id) do update
		   set email_verified = public.users.email_verified or excluded.email_verified
		returning (xmax = 0) as inserted`);
	const newUsers = users.rows.filter(row => row.inserted).length;

	// Never overwrites a password: after the switch the user may have changed it in Better Auth.
	const passwords = await client.query(`
		insert into public.accounts (user_id, provider_id, account_id, password, created_at, updated_at)
		select u.id, 'credential', u.id::text, u.encrypted_password, u.created_at, now()
		  from auth.users u
		  join public.users nu on nu.id = u.id
		 where u.encrypted_password is not null and u.encrypted_password <> ''
		on conflict (provider_id, account_id) do nothing`);

	// GoTrue's provider_id is the provider's own user id: Google's `sub`, GitHub's numeric id, as Better Auth stores them.
	const social = await client.query<{ provider: string }>(`
		insert into public.accounts (user_id, provider_id, account_id, created_at, updated_at)
		select i.user_id, i.provider, i.provider_id, i.created_at, now()
		  from auth.identities i
		  join public.users nu on nu.id = i.user_id
		 where i.provider in ('google', 'github')
		on conflict (provider_id, account_id) do nothing
		returning provider_id as provider`);

	const totals = {
		gotrue: await count(`select count(*) as n from auth.users`),
		skipped: await count(
			`select count(*) as n from auth.users u where not (${MIGRATED})`
		),
		users: await count(`select count(*) as n from public.users`),
		unverified: await count(
			`select count(*) as n from public.users where not email_verified`
		),
		orphanProfiles: await count(
			`select count(*) as n from public.profiles p where not exists (select 1 from public.users u where u.id = p.id)`
		),
	};
	const google = social.rows.filter(row => row.provider === "google").length;
	const github = social.rows.filter(row => row.provider === "github").length;

	console.log(
		`Utenti GoTrue            ${totals.gotrue} (${totals.skipped} esclusi: cancellati, anonimi o senza email)`
	);
	console.log(
		`Utenti nuovi             ${newUsers} (in public.users ora: ${totals.users}, ${totals.unverified} con email non confermata)`
	);
	console.log(`Account con password     ${passwords.rowCount} nuovi`);
	console.log(`Account Google / GitHub  ${google} / ${github} nuovi`);
	console.log(`Profili senza utente     ${totals.orphanProfiles}`);

	if (totals.orphanProfiles > 0) {
		console.error(
			"\nCi sono profili senza utente: la migration 0002 fallirebbe. Nulla è stato scritto."
		);
		await client.query("rollback");
		process.exit(1);
	}

	if (apply) {
		await client.query("commit");
		console.log("\nApplicato. Un secondo giro non scrive nulla di nuovo.");
	} else {
		await client.query("rollback");
		console.log("\nProva a vuoto, annullata. Per scrivere: aggiungi --apply.");
	}
} catch (error) {
	await client.query("rollback");
	throw error;
} finally {
	await client.end();
}
