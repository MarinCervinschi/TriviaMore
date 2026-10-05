/** Shared by the zod schemas and the dialog sliders, so a slider never asks for more than the server takes. */
export const MAX_SESSION_ITEMS = 100;

export function sessionCap(available: number): number {
	return Math.max(1, Math.min(available, MAX_SESSION_ITEMS));
}

/** Must not claim "all" when the count is at the ceiling. */
export function sessionHint(count: number, cap: number, available: number): string {
	if (count === available) return `Tutte (${available})`;
	if (count === cap && cap < available) return `${cap} di ${available} · massimo`;
	return `${count} di ${available}`;
}
