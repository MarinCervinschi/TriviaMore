import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContactInput } from "../contact-schema";
import { submitContact } from "./contact";

const request = vi.hoisted(() => ({ ip: "" }));
const sendMail = vi.hoisted(() => vi.fn(async () => {}));

vi.mock("@/lib/email/server", () => ({ sendMail }));

vi.mock("@/lib/logging/server", () => ({
	log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@tanstack/react-start/server", async importOriginal => ({
	...(await importOriginal<typeof import("@tanstack/react-start/server")>()),
	getRequestHeaders: () => new Headers({ "cf-connecting-ip": request.ip }),
}));

vi.stubEnv("CONTACT_RECIPIENT", "contatti@trivia-more.it");
vi.stubEnv("CLIENT_IP_HEADER", undefined);
vi.stubEnv("LIMITADOR_URL", undefined);

const MESSAGE: ContactInput = {
	name: "Mario Rossi",
	email: "mario@esempio.com",
	type: "bug",
	subject: "Una domanda sbagliata",
	message: "La risposta della domanda 3 è errata.",
	website: "",
};

beforeEach(() => {
	sendMail.mockClear();
});

describe("submitContact", () => {
	it("sends three messages an hour from one IP and refuses the fourth", async () => {
		request.ip = "203.0.113.10";
		const results = [];
		for (let attempt = 0; attempt < 4; attempt++) {
			results.push(await submitContact(MESSAGE));
		}

		expect(results.slice(0, 3)).toEqual(Array(3).fill({ success: true }));
		expect(results[3]).toEqual({
			success: false,
			error: "Troppi messaggi inviati di recente. Riprova più tardi.",
		});
		expect(sendMail).toHaveBeenCalledTimes(3);

		request.ip = "203.0.113.11";
		expect(await submitContact(MESSAGE)).toEqual({ success: true });
	});

	it("does not count a submission that fills the honeypot", async () => {
		request.ip = "203.0.113.20";
		for (let attempt = 0; attempt < 5; attempt++) {
			await submitContact({ ...MESSAGE, website: "https://spam.example" });
		}

		expect(sendMail).not.toHaveBeenCalled();
		expect(await submitContact(MESSAGE)).toEqual({ success: true });
	});
});
