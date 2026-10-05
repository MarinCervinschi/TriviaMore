import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { legalAcceptances } from "@/db/schema";

import { findLatestAcceptedVersions } from "./db/legal-acceptances";
import type { LegalAcceptance, LegalAcceptanceStatus } from "./types";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "./versions";

export async function getAcceptanceStatus(
	userId: string | null
): Promise<LegalAcceptanceStatus | null> {
	if (!userId) return null;

	const latest = await findLatestAcceptedVersions(getDb(), userId);
	const acceptedTermsVersion = latest.get("TERMS") ?? null;
	const acceptedPrivacyVersion = latest.get("PRIVACY") ?? null;

	return {
		acceptedTermsVersion,
		acceptedPrivacyVersion,
		hasAcceptedTerms: acceptedTermsVersion === CURRENT_TERMS_VERSION,
		hasAcceptedPrivacy: acceptedPrivacyVersion === CURRENT_PRIVACY_VERSION,
	};
}

/** Also called during signup, before the user is authenticated. */
export async function insertLegalAcceptances(
	userId: string,
	termsVersion = CURRENT_TERMS_VERSION,
	privacyVersion = CURRENT_PRIVACY_VERSION
) {
	let ipAddress: string | null = null;
	let userAgent: string | null = null;
	try {
		userAgent = getRequestHeader("user-agent") ?? null;
		// Cloudflare's header first, because the first X-Forwarded-For entry is whatever the client sent.
		ipAddress =
			getRequestHeader("cf-connecting-ip") ??
			getRequestIP({ xForwardedFor: true }) ??
			null;
	} catch {
		// Request helpers throw outside a request context.
	}

	await getDb()
		.insert(legalAcceptances)
		.values([
			{
				userId,
				documentType: "TERMS",
				version: termsVersion,
				ipAddress,
				userAgent,
			},
			{
				userId,
				documentType: "PRIVACY",
				version: privacyVersion,
				ipAddress,
				userAgent,
			},
		]);
}

export async function getAcceptanceHistory(userId: string): Promise<LegalAcceptance[]> {
	return getDb()
		.select()
		.from(legalAcceptances)
		.where(eq(legalAcceptances.userId, userId))
		.orderBy(desc(legalAcceptances.acceptedAt));
}
