/** Fisher-Yates shuffle — returns a new shuffled array */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** Select `count` random items from array without duplicates */
export function selectRandomItems<T>(array: T[], count: number): T[] {
  if (count >= array.length) return shuffleArray(array)

  const indices = new Set<number>()
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * array.length))
  }

  return [...indices].map((i) => array[i])
}
