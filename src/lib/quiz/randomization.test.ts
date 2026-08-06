import { afterEach, describe, expect, it, vi } from "vitest"

import { selectRandomItems, shuffleArray } from "./randomization"

const source = [1, 2, 3, 4, 5, 6, 7, 8]

describe("shuffleArray", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns a new array and leaves the input untouched", () => {
    const input = [...source]
    const result = shuffleArray(input)
    expect(result).not.toBe(input)
    expect(input).toEqual(source)
  })

  it("is a permutation: same length and same multiset of elements", () => {
    const result = shuffleArray(source)
    expect(result).toHaveLength(source.length)
    expect([...result].sort((a, b) => a - b)).toEqual(source)
  })

  it("handles empty and single-element arrays", () => {
    expect(shuffleArray([])).toEqual([])
    expect(shuffleArray([42])).toEqual([42])
  })
})

describe("selectRandomItems", () => {
  it("returns every element (shuffled) when count meets or exceeds the size", () => {
    expect(selectRandomItems(source, source.length).sort((a, b) => a - b)).toEqual(
      source,
    )
    expect(selectRandomItems(source, source.length + 5)).toHaveLength(
      source.length,
    )
  })

  it("returns exactly `count` distinct elements drawn from the source", () => {
    for (let run = 0; run < 50; run++) {
      const picked = selectRandomItems(source, 3)
      expect(picked).toHaveLength(3)
      expect(new Set(picked).size).toBe(3)
      for (const item of picked) expect(source).toContain(item)
    }
  })

  it("selects the deterministic index when Math.random is pinned", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    // A single index (0) is drawn; the Set never grows past one distinct value.
    expect(selectRandomItems(source, 1)).toEqual([source[0]])
    vi.restoreAllMocks()
  })
})
