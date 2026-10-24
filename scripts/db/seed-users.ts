// One made-up account per role, signing in with STAGING_SEED_PASSWORD; skips an address that already exists.
import { asc, eq } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	accounts,
	courseClasses,
	courseMaintainers,
	courses,
	legalAcceptances,
	profiles,
	sections,
	users,
} from "../../src/db/schema/index.ts";
import { hashPassword } from "../../src/lib/auth/rules.ts";
import {
	CURRENT_PRIVACY_VERSION,
	CURRENT_TERMS_VERSION,
} from "../../src/lib/legal/versions.ts";

const password = process.env.STAGING_SEED_PASSWORD;
if (!password) {
	console.error("STAGING_SEED_PASSWORD is not set: add it to staging → /infra.");
	process.exit(1);
}

const ROLES = [
	{ role: "STUDENT", name: "Studente Prova", email: "seed-studente@trivia-more.it" },
	{
		role: "MAINTAINER",
		name: "Maintainer Prova",
		email: "seed-maintainer@trivia-more.it",
	},
	{ role: "ADMIN", name: "Admin Prova", email: "seed-admin@trivia-more.it" },
	{
		role: "SUPERADMIN",
		name: "Superadmin Prova",
		email: "seed-superadmin@trivia-more.it",
	},
] as const;

const db = getDb();
const hash = await hashPassword(password);

const [maintained] = await db
	.selectDistinct({ id: courses.id, position: courses.position, code: courses.code })
	.from(courses)
	.innerJoin(courseClasses, eq(courseClasses.courseId, courses.id))
	.innerJoin(sections, eq(sections.classId, courseClasses.classId))
	.orderBy(asc(courses.position), asc(courses.code))
	.limit(1);

let created = 0;
for (const spec of ROLES) {
	const [existing] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, spec.email));
	if (existing) continue;

	await db.transaction(async tx => {
		const [user] = await tx
			.insert(users)
			.values({ name: spec.name, email: spec.email, emailVerified: true })
			.returning({ id: users.id });
		await tx.insert(accounts).values({
			userId: user!.id,
			providerId: "credential",
			accountId: user!.id,
			password: hash,
		});
		await tx.insert(profiles).values({
			id: user!.id,
			name: spec.name,
			email: spec.email,
			role: spec.role,
		});
		if (spec.role === "MAINTAINER" && maintained) {
			await tx
				.insert(courseMaintainers)
				.values({ userId: user!.id, courseId: maintained.id });
		}
		await tx.insert(legalAcceptances).values([
			{ userId: user!.id, documentType: "TERMS", version: CURRENT_TERMS_VERSION },
			{ userId: user!.id, documentType: "PRIVACY", version: CURRENT_PRIVACY_VERSION },
		]);
	});
	created += 1;
}

console.log(`  ${created} utenti nuovi su ${ROLES.length}`);
await closeDb();
