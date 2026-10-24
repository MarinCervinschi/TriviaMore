import { describe, expect, it } from "vitest";

import { renderAuthLinkEmail } from "@/lib/email/templates/auth-link";

const URL_WITH_QUERY =
	"https://trivia-more.it/api/auth/verify-email?token=abc&callbackURL=/auth/confirm";

describe("renderAuthLinkEmail", () => {
	it("puts the link and its expiry in both parts", () => {
		const email = renderAuthLinkEmail({
			purpose: "verify-email",
			url: URL_WITH_QUERY,
			expiresInMinutes: 60,
		});
		expect(email.text).toContain(URL_WITH_QUERY);
		expect(email.html).toContain(URL_WITH_QUERY.replace("&", "&amp;"));
		for (const part of [email.html, email.text]) expect(part).toContain("60 minuti");
	});

	it("words each purpose differently", () => {
		const verify = renderAuthLinkEmail({
			purpose: "verify-email",
			url: "u",
			expiresInMinutes: 5,
		});
		const reset = renderAuthLinkEmail({
			purpose: "reset-password",
			url: "u",
			expiresInMinutes: 5,
		});
		expect(verify.subject).not.toBe(reset.subject);
		expect(reset.text).toContain("password");
	});
});
