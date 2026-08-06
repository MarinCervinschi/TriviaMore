import { eq, sql } from "drizzle-orm"

import type { AuthUser } from "@/lib/auth/types"
import {
  classes,
  courseClasses,
  courseMaintainers,
  courses,
  departments,
  profiles,
  sections,
} from "@/db/schema"

import type { TestTx } from "./db"

function shortId() {
  return crypto.randomUUID().slice(0, 8)
}

// profiles.id references auth.users.id, so a profile needs a backing auth user.
// GoTrue's auth.users defaults every column but the id, and an on-insert trigger
// then creates the matching profile with the default STUDENT role. The role is
// reset by delete + insert rather than update: a BEFORE UPDATE trigger on
// profiles guards role changes and is off-limits to a plain fixture.
export async function createUser(
  tx: TestTx,
  role: AuthUser["role"] = "MAINTAINER",
): Promise<string> {
  const id = crypto.randomUUID()
  await tx.execute(sql`insert into auth.users (id) values (${id})`)
  await tx.delete(profiles).where(eq(profiles.id, id))
  await tx.insert(profiles).values({ id, role })
  return id
}

async function createDepartment(tx: TestTx): Promise<string> {
  const [row] = await tx
    .insert(departments)
    .values({ name: "Dip. Test", code: `D-${shortId()}` })
    .returning({ id: departments.id })
  return row.id
}

async function createCourse(tx: TestTx, departmentId: string): Promise<string> {
  const [row] = await tx
    .insert(courses)
    .values({ name: "Corso Test", code: `C-${shortId()}`, departmentId })
    .returning({ id: courses.id })
  return row.id
}

async function createClass(tx: TestTx): Promise<string> {
  const [row] = await tx
    .insert(classes)
    .values({ name: "Insegnamento Test" })
    .returning({ id: classes.id })
  return row.id
}

async function linkClassToCourse(
  tx: TestTx,
  courseId: string,
  classId: string,
): Promise<void> {
  await tx
    .insert(courseClasses)
    .values({ courseId, classId, code: `CC-${shortId()}`, classYear: 1 })
}

async function createSection(
  tx: TestTx,
  classId: string,
  isPublic: boolean,
): Promise<string> {
  const [row] = await tx
    .insert(sections)
    // slug is generated from the name and is unique per class, so the name must
    // differ between sibling sections.
    .values({ name: `Sezione ${shortId()}`, classId, isPublic })
    .returning({ id: sections.id })
  return row.id
}

export type MaintainerScope = {
  maintainer: string
  maintainedCourse: string
  otherCourse: string
  classInScope: string
  classOutOfScope: string
  publicSection: string
  privateSection: string
  sectionOutOfScope: string
}

// A minimal catalog graph exercising the MAINTAINER scoping rules: one course
// the user maintains and one they do not, each with its own class and sections.
export async function seedMaintainerScope(tx: TestTx): Promise<MaintainerScope> {
  const maintainer = await createUser(tx, "MAINTAINER")
  const departmentId = await createDepartment(tx)
  const maintainedCourse = await createCourse(tx, departmentId)
  const otherCourse = await createCourse(tx, departmentId)

  const classInScope = await createClass(tx)
  const classOutOfScope = await createClass(tx)
  await linkClassToCourse(tx, maintainedCourse, classInScope)
  await linkClassToCourse(tx, otherCourse, classOutOfScope)

  await tx.insert(courseMaintainers).values({ userId: maintainer, courseId: maintainedCourse })

  return {
    maintainer,
    maintainedCourse,
    otherCourse,
    classInScope,
    classOutOfScope,
    publicSection: await createSection(tx, classInScope, true),
    privateSection: await createSection(tx, classInScope, false),
    sectionOutOfScope: await createSection(tx, classOutOfScope, true),
  }
}
