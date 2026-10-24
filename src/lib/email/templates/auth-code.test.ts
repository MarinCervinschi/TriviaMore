import { describe, expect, it } from "vitest";

import { renderAuthCodeEmail } from "@/lib/email/templates/auth-code";

describe("renderAuthCodeEmail", () => {
	it("puts the code and its expiry in both parts", () => {
		const email = renderAuthCodeEmail({
			purpose: "email-verification",
			code: "482913",
			expiresInMinutes: 10,
		});
		for (const part of [email.html, email.text]) {
			expect(part).toContain("482913");
			expect(part).toContain("10 minuti");
		}
	});

	it("words each purpose differently", () => {
		const verify = renderAuthCodeEmail({
			purpose: "email-verification",
			code: "1",
			expiresInMinutes: 5,
		});
		const reset = renderAuthCodeEmail({
			purpose: "forget-password",
			code: "1",
			expiresInMinutes: 5,
		});
		expect(verify.subject).not.toBe(reset.subject);
		expect(reset.text).toContain("password");
	});
});
