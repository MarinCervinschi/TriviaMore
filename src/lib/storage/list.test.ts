import { describe, expect, it } from "vitest";

import { parseListPage } from "./server";

const page = (body: string) =>
	`<?xml version="1.0" encoding="UTF-8"?><ListBucketResult>${body}</ListBucketResult>`;

describe("parseListPage", () => {
	it("reads each object's key, date and size", () => {
		const { objects, next } = parseListPage(
			page(`<IsTruncated>false</IsTruncated>
				<Contents><Key>u1/a&amp;b.pdf</Key><LastModified>2026-11-01T10:00:00.000Z</LastModified><Size>42</Size></Contents>
				<Contents><Key>u2/c.docx</Key><LastModified>2026-11-02T10:00:00.000Z</LastModified><Size>7</Size></Contents>`)
		);

		expect(objects).toEqual([
			{
				key: "u1/a&b.pdf",
				lastModified: new Date("2026-11-01T10:00:00.000Z"),
				size: 42,
			},
			{ key: "u2/c.docx", lastModified: new Date("2026-11-02T10:00:00.000Z"), size: 7 },
		]);
		expect(next).toBeUndefined();
	});

	it("returns the continuation token of a truncated page", () => {
		const { objects, next } = parseListPage(
			page(
				"<IsTruncated>true</IsTruncated><NextContinuationToken>abc=</NextContinuationToken>"
			)
		);

		expect(objects).toEqual([]);
		expect(next).toBe("abc=");
	});
});
