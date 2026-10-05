// Seeded, because the selection is rebuilt from the seed in the session id.
function seededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) & 0xffffffff;
		return (state >>> 0) / 0xffffffff;
	};
}

export function selectRandomItemsWithSeed<T>(
	items: T[],
	count: number,
	seed: number
): T[] {
	const random = seededRandom(seed);
	const shuffled = [...items];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, Math.min(count, shuffled.length));
}
