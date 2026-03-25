import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54321"
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error(
    "Missing env vars. Run with: infisical run -- pnpm tsx supabase/scripts/verify-rls.ts"
  )
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Create an anon client (no auth session)
const anon = createClient(SUPABASE_URL, ANON_KEY)

let passed = 0
let failed = 0

function assert(label: string, ok: boolean) {
  if (ok) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.log(`  ✗ ${label}`)
    failed++
  }
}

async function createTestUser(
  email: string,
  name: string
): Promise<{ id: string; client: SupabaseClient }> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "test123456",
    email_confirm: true,
    user_metadata: { full_name: name },
  })
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`)

  // Sign in to get a session
  const { data: session, error: signInError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  })
  if (signInError) throw new Error(`Failed to generate link for ${email}: ${signInError.message}`)

  // Use signInWithPassword for a proper session
  const client = createClient(SUPABASE_URL, ANON_KEY!)
  const { error: loginError } = await client.auth.signInWithPassword({
    email,
    password: "test123456",
  })
  if (loginError) throw new Error(`Failed to sign in ${email}: ${loginError.message}`)

  return { id: data.user.id, client }
}

async function main() {
  console.log("=== RLS Verification ===\n")

  // ----------------------------------------------------------
  // Setup: create test users
  // ----------------------------------------------------------
  console.log("--- Setup: creating test users ---\n")

  const superadmin = await createTestUser("rls-superadmin@test.local", "Superadmin")
  const deptAdmin = await createTestUser("rls-admin@test.local", "Dept Admin")
  const maintainer = await createTestUser("rls-maintainer@test.local", "Maintainer")
  const studentA = await createTestUser("rls-student-a@test.local", "Student A")
  const studentB = await createTestUser("rls-student-b@test.local", "Student B")

  console.log("  ✓ 5 test users created\n")

  // Assign roles via admin client (bypasses RLS)
  await admin.from("profiles").update({ role: "SUPERADMIN" }).eq("id", superadmin.id)
  await admin.from("profiles").update({ role: "ADMIN" }).eq("id", deptAdmin.id)
  await admin.from("profiles").update({ role: "MAINTAINER" }).eq("id", maintainer.id)

  // ----------------------------------------------------------
  // Setup: seed test data
  // ----------------------------------------------------------
  console.log("--- Setup: seeding test data ---\n")

  const deptId = "rls-test-dept"
  const courseId = "rls-test-course"
  const classId = "rls-test-class"
  const publicSectionId = "rls-test-section-pub"
  const privateSectionId = "rls-test-section-priv"
  const questionPubId = "rls-test-q-pub"
  const questionPrivId = "rls-test-q-priv"
  const evalModeId = "rls-test-eval"

  await admin.from("departments").insert({ id: deptId, name: "Test Dept", code: "TEST" })
  await admin.from("department_admins").insert({ user_id: deptAdmin.id, department_id: deptId })
  await admin.from("courses").insert({
    id: courseId, name: "Test Course", code: "TC", department_id: deptId,
  })
  await admin.from("course_maintainers").insert({ user_id: maintainer.id, course_id: courseId })
  await admin.from("classes").insert({
    id: classId, name: "Test Class", code: "CL1", course_id: courseId, class_year: 1,
  })
  await admin.from("sections").insert([
    { id: publicSectionId, name: "Public Section", class_id: classId, is_public: true },
    { id: privateSectionId, name: "Private Section", class_id: classId, is_public: false },
  ])
  await admin.from("section_access").insert({
    user_id: studentA.id, section_id: privateSectionId,
  })
  await admin.from("questions").insert([
    {
      id: questionPubId, content: "Public Q?", question_type: "MULTIPLE_CHOICE",
      correct_answer: ["A"], section_id: publicSectionId,
    },
    {
      id: questionPrivId, content: "Private Q?", question_type: "MULTIPLE_CHOICE",
      correct_answer: ["B"], section_id: privateSectionId,
    },
  ])
  await admin.from("evaluation_modes").insert({
    id: evalModeId, name: "RLS Test Mode",
  })

  // Student A bookmark + student B bookmark (for isolation test)
  await admin.from("bookmarks").insert({ user_id: studentA.id, question_id: questionPubId })
  await admin.from("bookmarks").insert({ user_id: studentB.id, question_id: questionPubId })

  console.log("  ✓ Test data seeded\n")

  // ----------------------------------------------------------
  // Tests: Anonymous access
  // ----------------------------------------------------------
  console.log("--- Anonymous access ---\n")

  const { data: anonDepts } = await anon.from("departments").select("id")
  assert("anon can read departments", (anonDepts?.length ?? 0) > 0)

  const { data: anonCourses } = await anon.from("courses").select("id")
  assert("anon can read courses", (anonCourses?.length ?? 0) > 0)

  const { data: anonClasses } = await anon.from("classes").select("id")
  assert("anon can read classes", (anonClasses?.length ?? 0) > 0)

  const { data: anonPubSections } = await anon.from("sections").select("id").eq("id", publicSectionId)
  assert("anon can read public sections", (anonPubSections?.length ?? 0) === 1)

  const { data: anonPrivSections } = await anon.from("sections").select("id").eq("id", privateSectionId)
  assert("anon cannot read private sections", (anonPrivSections?.length ?? 0) === 0)

  const { data: anonPubQuestions } = await anon.from("questions").select("id").eq("section_id", publicSectionId)
  assert("anon can read public section questions", (anonPubQuestions?.length ?? 0) === 1)

  const { data: anonPrivQuestions } = await anon.from("questions").select("id").eq("section_id", privateSectionId)
  assert("anon cannot read private section questions", (anonPrivQuestions?.length ?? 0) === 0)

  const { error: anonInsertDept } = await anon.from("departments").insert({ id: "hack", name: "Hack", code: "HACK" })
  assert("anon cannot insert departments", anonInsertDept !== null)

  const { data: anonBookmarks } = await anon.from("bookmarks").select("*")
  assert("anon cannot read bookmarks", (anonBookmarks?.length ?? 0) === 0)

  const { data: anonEvalModes } = await anon.from("evaluation_modes").select("id")
  assert("anon can read evaluation_modes", (anonEvalModes?.length ?? 0) > 0)

  console.log()

  // ----------------------------------------------------------
  // Tests: Student data isolation
  // ----------------------------------------------------------
  console.log("--- Student data isolation ---\n")

  const { data: studentABookmarks } = await studentA.client.from("bookmarks").select("*")
  assert("student A sees own bookmarks", (studentABookmarks?.length ?? 0) === 1)

  const { data: studentBBookmarks } = await studentB.client.from("bookmarks").select("*")
  assert("student B sees own bookmarks", (studentBBookmarks?.length ?? 0) === 1)

  // Student A cannot see student B's bookmarks (already verified by count)
  assert("student A sees exactly 1 bookmark (not B's)", studentABookmarks?.length === 1)

  console.log()

  // ----------------------------------------------------------
  // Tests: Private section access
  // ----------------------------------------------------------
  console.log("--- Private section access ---\n")

  const { data: studentAPrivSections } = await studentA.client.from("sections").select("id").eq("id", privateSectionId)
  assert("student A (with section_access) can read private section", (studentAPrivSections?.length ?? 0) === 1)

  const { data: studentBPrivSections } = await studentB.client.from("sections").select("id").eq("id", privateSectionId)
  assert("student B (without section_access) cannot read private section", (studentBPrivSections?.length ?? 0) === 0)

  const { data: studentAPrivQuestions } = await studentA.client.from("questions").select("id").eq("section_id", privateSectionId)
  assert("student A can read private section questions", (studentAPrivQuestions?.length ?? 0) === 1)

  const { data: studentBPrivQuestions } = await studentB.client.from("questions").select("id").eq("section_id", privateSectionId)
  assert("student B cannot read private section questions", (studentBPrivQuestions?.length ?? 0) === 0)

  // Maintainer can access private section (admin of parent course)
  const { data: maintainerPrivSections } = await maintainer.client.from("sections").select("id").eq("id", privateSectionId)
  assert("maintainer can read private section (admin path)", (maintainerPrivSections?.length ?? 0) === 1)

  console.log()

  // ----------------------------------------------------------
  // Tests: Student cannot write content
  // ----------------------------------------------------------
  console.log("--- Student write restrictions ---\n")

  const { error: studentInsertDept } = await studentA.client.from("departments").insert({
    id: "hack", name: "Hack", code: "HACK",
  })
  assert("student cannot insert department", studentInsertDept !== null)

  const { error: studentInsertQuestion } = await studentA.client.from("questions").insert({
    id: "hack-q", content: "Hack?", question_type: "TRUE_FALSE",
    correct_answer: ["true"], section_id: publicSectionId,
  })
  assert("student cannot insert questions", studentInsertQuestion !== null)

  const { error: studentInsertEval } = await studentA.client.from("evaluation_modes").insert({
    id: "hack-eval", name: "Hack Mode",
  })
  assert("student cannot insert evaluation_modes", studentInsertEval !== null)

  console.log()

  // ----------------------------------------------------------
  // Tests: Role escalation prevention
  // ----------------------------------------------------------
  console.log("--- Role escalation prevention ---\n")

  const { error: escalationError } = await studentA.client
    .from("profiles")
    .update({ role: "SUPERADMIN" })
    .eq("id", studentA.id)
  assert("student cannot escalate own role", escalationError !== null)

  console.log()

  // ----------------------------------------------------------
  // Tests: Admin hierarchy
  // ----------------------------------------------------------
  console.log("--- Admin hierarchy ---\n")

  // Maintainer can write to their course's content
  const testQuestionId = "rls-test-maint-q"
  const { error: maintainerInsertQ } = await maintainer.client.from("questions").insert({
    id: testQuestionId, content: "Maint Q?", question_type: "TRUE_FALSE",
    correct_answer: ["true"], section_id: publicSectionId,
  })
  assert("maintainer can insert questions in own course", maintainerInsertQ === null)

  // Clean up the inserted question
  if (!maintainerInsertQ) {
    await admin.from("questions").delete().eq("id", testQuestionId)
  }

  // Dept admin can write to courses in their department
  const testCourseId = "rls-test-admin-course"
  const { error: adminInsertCourse } = await deptAdmin.client.from("courses").insert({
    id: testCourseId, name: "Admin Course", code: "AC", department_id: deptId,
  })
  assert("dept admin can insert courses in own department", adminInsertCourse === null)

  if (!adminInsertCourse) {
    await admin.from("courses").delete().eq("id", testCourseId)
  }

  // Create another department for scope test
  const otherDeptId = "rls-test-dept-other"
  await admin.from("departments").insert({ id: otherDeptId, name: "Other Dept", code: "OTHER" })

  const { error: adminInsertOtherCourse } = await deptAdmin.client.from("courses").insert({
    id: "rls-hack-course", name: "Hack", code: "HK", department_id: otherDeptId,
  })
  assert("dept admin cannot insert courses in other department", adminInsertOtherCourse !== null)

  await admin.from("departments").delete().eq("id", otherDeptId)

  // Superadmin can do everything
  const { error: superInsertDept } = await superadmin.client.from("departments").insert({
    id: "rls-super-dept", name: "Super Dept", code: "SUPER",
  })
  assert("superadmin can insert departments", superInsertDept === null)

  if (!superInsertDept) {
    await admin.from("departments").delete().eq("id", "rls-super-dept")
  }

  console.log()

  // ----------------------------------------------------------
  // Tests: User-owned data CRUD
  // ----------------------------------------------------------
  console.log("--- User-owned data CRUD ---\n")

  // user_classes
  const { error: saveClass } = await studentA.client.from("user_classes").insert({
    user_id: studentA.id, class_id: classId,
  })
  assert("student can save a class", saveClass === null)

  const { data: myClasses } = await studentA.client.from("user_classes").select("*")
  assert("student can read own saved classes", (myClasses?.length ?? 0) === 1)

  const { error: deleteClass } = await studentA.client.from("user_classes").delete().match({
    user_id: studentA.id, class_id: classId,
  })
  assert("student can delete own saved class", deleteClass === null)

  // Cannot insert for another user
  const { error: insertOtherClass } = await studentA.client.from("user_classes").insert({
    user_id: studentB.id, class_id: classId,
  })
  assert("student cannot insert user_classes for another user", insertOtherClass !== null)

  // progress
  const { error: insertProgress } = await studentA.client.from("progress").insert({
    id: "rls-test-progress", user_id: studentA.id, section_id: publicSectionId,
    quiz_mode: "STUDY", quizzes_taken: 1,
  })
  assert("student can insert own progress", insertProgress === null)

  const { data: myProgress } = await studentA.client.from("progress").select("*")
  assert("student can read own progress", (myProgress?.length ?? 0) === 1)

  if (!insertProgress) {
    await admin.from("progress").delete().eq("id", "rls-test-progress")
  }

  console.log()

  // ----------------------------------------------------------
  // Tests: Profile read
  // ----------------------------------------------------------
  console.log("--- Profile access ---\n")

  const { data: ownProfile } = await studentA.client.from("profiles").select("*").eq("id", studentA.id)
  assert("student can read own profile", (ownProfile?.length ?? 0) === 1)

  const { data: otherProfile } = await studentA.client.from("profiles").select("*").eq("id", studentB.id)
  assert("student cannot read other profiles", (otherProfile?.length ?? 0) === 0)

  const { data: superProfiles } = await superadmin.client.from("profiles").select("id")
  assert("superadmin can read all profiles", (superProfiles?.length ?? 0) >= 5)

  console.log()

  // ----------------------------------------------------------
  // Tests: handle_new_user trigger still works
  // ----------------------------------------------------------
  console.log("--- Trigger verification ---\n")

  const { data: triggerUser, error: triggerError } = await admin.auth.admin.createUser({
    email: "rls-trigger-test@test.local",
    password: "test123456",
    email_confirm: true,
    user_metadata: { full_name: "Trigger Test" },
  })
  if (triggerError) {
    assert("handle_new_user trigger works after RLS", false)
  } else {
    const { data: triggerProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", triggerUser.user.id)
      .single()
    assert(
      "handle_new_user trigger still creates profile with RLS enabled",
      triggerProfile !== null && triggerProfile.name === "Trigger Test"
    )
    await admin.auth.admin.deleteUser(triggerUser.user.id)
  }

  console.log()

  // ----------------------------------------------------------
  // Cleanup
  // ----------------------------------------------------------
  console.log("--- Cleanup ---\n")

  // Delete test data (order matters for FK constraints)
  await admin.from("bookmarks").delete().in("user_id", [studentA.id, studentB.id])
  await admin.from("section_access").delete().eq("section_id", privateSectionId)
  await admin.from("questions").delete().in("id", [questionPubId, questionPrivId])
  await admin.from("sections").delete().in("id", [publicSectionId, privateSectionId])
  await admin.from("classes").delete().eq("id", classId)
  await admin.from("course_maintainers").delete().eq("course_id", courseId)
  await admin.from("courses").delete().eq("id", courseId)
  await admin.from("department_admins").delete().eq("department_id", deptId)
  await admin.from("departments").delete().eq("id", deptId)
  await admin.from("evaluation_modes").delete().eq("id", evalModeId)

  // Delete test users
  for (const user of [superadmin, deptAdmin, maintainer, studentA, studentB]) {
    await admin.auth.admin.deleteUser(user.id)
  }

  console.log("  ✓ All test data cleaned up\n")

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------
  console.log(`=== Results: ${passed} passed, ${failed} failed ===`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
