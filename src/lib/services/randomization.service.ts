/**
 * Service for managing randomization and shuffling functionalities.
 * Contains all methods for random selection and array shuffling.
 */
export class RandomizationService {
	/**
	 * Randomly shuffles an array using the Fisher-Yates algorithm.
	 * @param array Array to shuffle
	 * @returns New shuffled array
	 */
	static shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	/**
	 * Randomly shuffles an array using a custom random function.
	 * @param array Array to shuffle
	 * @param rng Custom random function
	 * @returns New shuffled array
	 */
	static shuffleArrayWithRng<T>(array: T[], rng: () => number): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	/**
	 * Randomly selects a specific number of items from an array.
	 * More efficient than a full shuffle when only a subset is needed.
	 * @param array Array to select from
	 * @param count Number of items to select
	 * @returns Array with selected items
	 */
	static selectRandomItems<T>(array: T[], count: number): T[] {
		if (count >= array.length) {
			return RandomizationService.shuffleArray(array);
		}

		const selected: T[] = [];
		const indices = new Set<number>();

		while (selected.length < count) {
			const randomIndex = Math.floor(Math.random() * array.length);
			if (!indices.has(randomIndex)) {
				indices.add(randomIndex);
				selected.push(array[randomIndex]);
			}
		}

		return selected;
	}

	/**
	 * Randomly selects a specific number of items from an array using a seed.
	 * Ensures consistent results for the same seed.
	 * @param array Array to select from
	 * @param count Number of items to select
	 * @param seed Seed for random generation
	 * @returns Array with selected items
	 */
	static selectRandomItemsWithSeed<T>(array: T[], count: number, seed: number): T[] {
		const rng = RandomizationService.seededRandom(seed);

		if (count >= array.length) {
			return RandomizationService.shuffleArrayWithRng(array, rng);
		}

		const selected: T[] = [];
		const indices = new Set<number>();

		while (selected.length < count) {
			const randomIndex = Math.floor(rng() * array.length);
			if (!indices.has(randomIndex)) {
				indices.add(randomIndex);
				selected.push(array[randomIndex]);
			}
		}

		return selected;
	}

	/**
	 * Generates a seeded random function for consistent results.
	 * @param seed Seed for generation
	 * @returns Function that generates random numbers based on the seed
	 */
	static seededRandom(seed: number): () => number {
		let x = Math.sin(seed) * 10000;
		return () => {
			x = Math.sin(x) * 10000;
			return x - Math.floor(x);
		};
	}
}
