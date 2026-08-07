import { describe, expect, it } from "vitest";

import { isCorrectOption, parseOptions } from "./options";

describe("parseOptions", () => {
	it("returns an empty array for null", () => {
		expect(parseOptions(null)).toEqual([]);
	});

	it("maps each option text to an id/text pair using the text as id", () => {
		expect(parseOptions(["Vero", "Falso"])).toEqual([
			{ id: "Vero", text: "Vero" },
			{ id: "Falso", text: "Falso" },
		]);
	});
});

describe("isCorrectOption", () => {
	it("is true when the option is among the correct answers", () => {
		expect(isCorrectOption("a", ["a", "b"])).toBe(true);
	});

	it("is false when the option is not among the correct answers", () => {
		expect(isCorrectOption("x", ["a", "b"])).toBe(false);
	});
});
