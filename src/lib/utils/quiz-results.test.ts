import { describe, expect, it } from "vitest"

import {
  formatTimeSpent,
  getPerformanceLevel,
  getScoreBadgeVariant,
} from "./quiz-results"

describe("getPerformanceLevel", () => {
  it.each([
    [30, "excellent"],
    [25, "good"],
    [24, "fair"],
    [20, "fair"],
    [19, "poor"],
  ] as const)("maps %d to %s", (score, level) => {
    expect(getPerformanceLevel(score).level).toBe(level)
  })
})

describe("getScoreBadgeVariant", () => {
  it.each([
    [30, "default"],
    [25, "secondary"],
    [20, "outline"],
    [19, "destructive"],
  ] as const)("maps %d to %s", (score, variant) => {
    expect(getScoreBadgeVariant(score)).toBe(variant)
  })
})

describe("formatTimeSpent", () => {
  it("shows only seconds under a minute", () => {
    expect(formatTimeSpent(5000)).toBe("5s")
    expect(formatTimeSpent(500)).toBe("0s")
  })

  it("shows minutes and seconds under an hour", () => {
    expect(formatTimeSpent(65_000)).toBe("1m 5s")
  })

  it("shows hours, minutes and seconds past an hour", () => {
    expect(formatTimeSpent(3_665_000)).toBe("1h 1m 5s")
  })
})
