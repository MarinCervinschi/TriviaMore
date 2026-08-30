import type { legalAcceptances } from "@/db/schema";

export type LegalAcceptance = typeof legalAcceptances.$inferSelect;

export type LegalAcceptanceStatus = {
	hasAcceptedTerms: boolean;
	hasAcceptedPrivacy: boolean;
	acceptedTermsVersion: string | null;
	acceptedPrivacyVersion: string | null;
};
