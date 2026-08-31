/**
 * The most questions or cards one session may draw.
 *
 * It used to live only inside the zod schemas, where the browser could not see
 * it: a section with more than a hundred questions — and an exam simulation,
 * which draws from every section of a class, reaches that easily — let the
 * slider ask for more than the server would take, and the run died on a
 * validation error the student could do nothing about. The dialogs cap their
 * sliders with the same number the schemas enforce.
 */
export const MAX_SESSION_ITEMS = 100;

/** What the slider may offer, given how many exist. */
export function sessionCap(available: number): number {
	return Math.max(1, Math.min(available, MAX_SESSION_ITEMS));
}

/** The line under the slider, which must not claim "all" when it is showing the ceiling. */
export function sessionHint(count: number, cap: number, available: number): string {
	if (count === available) return `Tutte (${available})`;
	if (count === cap && cap < available) return `${cap} di ${available} · massimo`;
	return `${count} di ${available}`;
}
