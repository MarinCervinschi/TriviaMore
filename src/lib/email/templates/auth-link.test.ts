import { describe, expect, it } from "vitest";

import { renderAuthLinkEmail } from "@/lib/email/templates/auth-link";

const URL_WITH_QUERY =
	"https://trivia-more.it/api/auth/reset-password/abc?callbackURL=/auth/reset-password&from=signup";

describe("renderAuthLinkEmail", () => {
	it("puts the link and its expiry in both parts", () => {
		const email = renderAuthLinkEmail({
			purpose: "set-password",
			url: URL_WITH_QUERY,
			expiresInMinutes: 60,
		});
		expect(email.text).toContain(URL_WITH_QUERY);
		expect(email.html).toContain(URL_WITH_QUERY.replace("&", "&amp;"));
		for (const part of [email.html, email.text]) expect(part).toContain("60 minuti");
	});

	it("words each purpose differently", () => {
		const confirm = renderAuthLinkEmail({
			purpose: "set-password",
			url: "u",
			expiresInMinutes: 5,
		});
		const reset = renderAuthLinkEmail({
			purpose: "reset-password",
			url: "u",
			expiresInMinutes: 5,
		});
		expect(confirm.subject).not.toBe(reset.subject);
		expect(reset.text).toContain("password");
	});
});
