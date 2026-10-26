import { getRequestHeader } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

import { profiles } from "@/db/schema";
import { Unauthorized } from "@/lib/server/errors";

import { ACCESS_CONFIGURED, verifyAccessToken } from "~/lib/access/middleware";
import { consoleDb } from "~/lib/db/client";
import { IS_PRODUCTION } from "~/lib/environment";

import type { ConsoleAccount, ConsoleSession } from "./types";

/** Whoever Cloudflare Access let in, which its policy limits to the owner; locally, an anonymous session. */
export async function getConsoleSession(): Promise<ConsoleSession | null> {
	if (!ACCESS_CONFIGURED) {
		return IS_PRODUCTION ? null : { userId: null, email: null };
	}
	let email: string;
	try {
		email = await verifyAccessToken(getRequestHeader("cf-access-jwt-assertion"));
	} catch {
		return null;
	}
	const profile = await findProfile(email);
	return { userId: profile?.id ?? null, email };
}

/** The owner's TriviaMore profile, matched by email; a missing or unreachable one still lets them in. */
async function findProfile(email: string) {
	try {
		const [profile] = await consoleDb()
			.select({ id: profiles.id, name: profiles.name, image: profiles.image })
			.from(profiles)
			.where(eq(profiles.email, email.toLowerCase()));
		return profile;
	} catch {
		return undefined;
	}
}

export async function getConsoleAccount(): Promise<ConsoleAccount | null> {
	const session = await getConsoleSession();
	if (!session) return null;
	const profile = session.email ? await findProfile(session.email) : undefined;
	return { ...session, name: profile?.name ?? null, image: profile?.image ?? null };
}

/** For every endpoint that reads or writes data: the page guard alone does not stop a direct call. */
export async function requireOwner(): Promise<ConsoleSession> {
	const session = await getConsoleSession();
	if (!session)
		throw new Unauthorized("Accesso riservato al proprietario della console.");
	return session;
}
