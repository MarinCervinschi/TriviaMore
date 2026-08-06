import { afterAll, describe, expect, it } from "vitest"

import { closeTestDb, withRollback } from "@/lib/testing/db"
import { seedMaintainerScope } from "@/lib/testing/fixtures"

import { classInMaintainedScope, maintainedCourseIds, sectionScope } from "./access"

afterAll(() => closeTestDb())

describe("maintainedCourseIds", () => {
  it("returns exactly the courses the user maintains", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      const ids = await maintainedCourseIds(tx, scope.maintainer)
      expect(ids).toEqual(new Set([scope.maintainedCourse]))
    }))

  it("returns an empty set for a user who maintains nothing", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      const ids = await maintainedCourseIds(tx, crypto.randomUUID())
      expect(ids.size).toBe(0)
      expect(ids.has(scope.maintainedCourse)).toBe(false)
    }))
})

describe("classInMaintainedScope", () => {
  it("is true for a class taught in a maintained course", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      expect(
        await classInMaintainedScope(tx, scope.maintainer, scope.classInScope),
      ).toBe(true)
    }))

  it("is false for a class taught only in a course the user does not maintain", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      expect(
        await classInMaintainedScope(tx, scope.maintainer, scope.classOutOfScope),
      ).toBe(false)
    }))
})

describe("sectionScope", () => {
  it("reports a public section of a maintained class as public and in scope", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      expect(await sectionScope(tx, scope.maintainer, scope.publicSection)).toEqual({
        isPublic: true,
        inScope: true,
      })
    }))

  it("reports a private section as private while still in scope", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      expect(await sectionScope(tx, scope.maintainer, scope.privateSection)).toEqual({
        isPublic: false,
        inScope: true,
      })
    }))

  it("reports a section of a non-maintained class as out of scope", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      expect(
        await sectionScope(tx, scope.maintainer, scope.sectionOutOfScope),
      ).toEqual({ isPublic: true, inScope: false })
    }))

  it("returns null for a section that does not exist", () =>
    withRollback(async (tx) => {
      const scope = await seedMaintainerScope(tx)
      expect(await sectionScope(tx, scope.maintainer, crypto.randomUUID())).toBeNull()
    }))
})
