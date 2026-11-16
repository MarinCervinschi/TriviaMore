import { describe, expect, it } from "vitest";

import { attachmentFileName } from "@/lib/requests/attachment-name";

describe("attachmentFileName", () => {
	it("keeps the author's name when the extensions agree", () => {
		expect(attachmentFileName("Appunti analisi.pdf", "u/1.pdf")).toBe(
			"Appunti analisi.pdf"
		);
	});

	it("takes the extension from the stored path", () => {
		expect(attachmentFileName("appunti.exe", "u/1.pdf")).toBe("appunti.pdf");
		expect(attachmentFileName("appunti.PDF", "u/1.docx")).toBe("appunti.docx");
		expect(attachmentFileName("appunti", "u/1.pdf")).toBe("appunti.pdf");
	});

	it("only strips the last extension", () => {
		expect(attachmentFileName("tesi.v2.html", "u/1.docx")).toBe("tesi.v2.docx");
	});

	it("drops directories and characters a filename cannot hold", () => {
		expect(attachmentFileName("../../etc/a.pdf", "u/1.pdf")).toBe("a.pdf");
		expect(attachmentFileName("C:\\x\\b.pdf", "u/1.pdf")).toBe("b.pdf");
		expect(attachmentFileName('a"b;c\r\nd.pdf', "u/1.pdf")).toBe("a_b_c__d.pdf");
	});

	it("removes direction overrides that would reorder the shown name", () => {
		expect(attachmentFileName("report\u202Efdp.exe", "u/1.pdf")).toBe("report_fdp.pdf");
	});

	it("falls back to a default name", () => {
		expect(attachmentFileName(".pdf", "u/1.pdf")).toBe("allegato.pdf");
		expect(attachmentFileName("...", "u/1.pdf")).toBe("allegato.pdf");
		expect(attachmentFileName("", "u/1.docx")).toBe("allegato.docx");
	});

	it("bounds the length", () => {
		expect(attachmentFileName(`${"a".repeat(300)}.pdf`, "u/1.pdf")).toBe(
			`${"a".repeat(100)}.pdf`
		);
	});

	it("adds no extension the upload could not have verified", () => {
		expect(attachmentFileName("a.pdf", "u/1.html")).toBe("a");
	});
});
