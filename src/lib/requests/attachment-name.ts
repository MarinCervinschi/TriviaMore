const EXTENSIONS = new Set(["pdf", "docx"]);
const UNSAFE = /[\u0000-\u001f\u007f-\u009f"*/:;<>?\\|​-‏‪-‮⁠-⁩﻿]/g;
const MAX_BASE_LENGTH = 100;

/** The name staff save an attachment under: the author's base name, with the extension the upload verified. */
export function attachmentFileName(fileName: string, filePath: string): string {
	const pathExtension = filePath.split(".").pop()?.toLowerCase() ?? "";
	const extension = EXTENSIONS.has(pathExtension) ? pathExtension : null;

	const last = fileName.split(/[/\\]/).pop() ?? "";
	const dot = last.lastIndexOf(".");
	const stem = dot >= 0 ? last.slice(0, dot) : last;
	const base =
		stem
			.replace(UNSAFE, "_")
			.replace(/\s+/g, " ")
			.slice(0, MAX_BASE_LENGTH)
			.replace(/^[\s.]+|[\s.]+$/g, "") || "allegato";

	return extension ? `${base}.${extension}` : base;
}
