import { redirect } from "@tanstack/react-router";

import { getDb } from "@/db";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import type { AuthUser } from "@/lib/auth/types";

import { findLatestAcceptedVersions } from "./db/legal-acceptances";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "./versions";

/** The signed-in user (an admin with `admin`) who has accepted the current terms, with one session check. */
export async function requireLegalAcceptance(admin = false): Promise<AuthUser> {
	const user = admin ? await requireAdmin() : await requireAuth();
	const latest = await findLatestAcceptedVersions(getDb(), user.id);

	if (
		latest.get("TERMS") !== CURRENT_TERMS_VERSION ||
		latest.get("PRIVACY") !== CURRENT_PRIVACY_VERSION
	) {
		throw redirect({ to: "/legal/accept" });
	}
	return user;
}
