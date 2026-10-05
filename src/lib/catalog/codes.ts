/** Removes all whitespace and keeps the case, so `MN1 - 1351` becomes `MN1-1351`. */
export function normaliseCatalogueCode(code: string): string {
	return code.replace(/\s+/g, "");
}
