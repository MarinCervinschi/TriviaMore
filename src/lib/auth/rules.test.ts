import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { hashPassword, isAllowedEmail, verifyPassword } from "@/lib/auth/rules";

describe("verifyPassword", () => {
	it("accepts a hash in the $2a$ form GoTrue wrote", async () => {
		const hash = bcrypt.hashSync("Segreta1", 4).replace(/^\$2b\$/, "$2a$");
		expect(hash.startsWith("$2a$")).toBe(true);
		expect(await verifyPassword({ hash, password: "Segreta1" })).toBe(true);
		expect(await verifyPassword({ hash, password: "segreta1" })).toBe(false);
	});

	it("checks a hash it made itself", async () => {
		const hash = await hashPassword("Segreta1");
		expect(await verifyPassword({ hash, password: "Segreta1" })).toBe(true);
	});
});

describe("isAllowedEmail", () => {
	it("allows any address when no domain is set", () => {
		expect(isAllowedEmail("chiunque@gmail.com")).toBe(true);
	});

	it("allows only the domain when one is set, ignoring case", () => {
		expect(isAllowedEmail("Marin@Trivia-More.it", "trivia-more.it")).toBe(true);
		expect(isAllowedEmail("marin@gmail.com", "trivia-more.it")).toBe(false);
		expect(isAllowedEmail("x@evil-trivia-more.it", "trivia-more.it")).toBe(false);
		expect(isAllowedEmail(null, "trivia-more.it")).toBe(false);
	});
});
