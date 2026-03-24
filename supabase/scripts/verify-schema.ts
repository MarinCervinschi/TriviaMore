import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54321"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var. Run with: infisical run -- pnpm tsx supabase/scripts/verify-schema.ts")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const TABLES = [
  "profiles",
  "departments",
  "department_admins",
  "courses",
  "course_maintainers",
  "classes",
  "user_recent_classes",
  "user_classes",
  "sections",
  "section_access",
  "questions",
  "evaluation_modes",
  "quizzes",
  "quiz_questions",
  "quiz_attempts",
  "answer_attempts",
  "bookmarks",
  "progress",
] as const

async function verifyTables() {
  console.log("=== Verifying tables ===\n")
  let ok = 0
  let fail = 0

  for (const table of TABLES) {
    const { error } = await supabase.from(table).select("*", { count: "exact", head: true })
    if (error) {
      console.log(`  ✗ ${table}: ${error.message}`)
      fail++
    } else {
      console.log(`  ✓ ${table}`)
      ok++
    }
  }

  console.log(`\n  ${ok}/${TABLES.length} tables OK${fail > 0 ? `, ${fail} failed` : ""}\n`)
  return fail === 0
}

async function verifyTrigger() {
  console.log("=== Verifying on_auth_user_created trigger ===\n")

  // Create a test user via auth admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "test-trigger@example.com",
    password: "test123456",
    email_confirm: true,
    user_metadata: { full_name: "Test User" },
  })

  if (authError) {
    console.log(`  ✗ Failed to create auth user: ${authError.message}`)
    return false
  }

  const userId = authData.user.id
  console.log(`  ✓ Auth user created: ${userId}`)

  // Check that the trigger created a profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    console.log(`  ✗ Profile not found: ${profileError?.message ?? "no data"}`)
    // Cleanup
    await supabase.auth.admin.deleteUser(userId)
    return false
  }

  console.log(`  ✓ Profile auto-created: name="${profile.name}", role="${profile.role}", email="${profile.email}"`)

  // Cleanup
  await supabase.auth.admin.deleteUser(userId)
  console.log(`  ✓ Test user cleaned up\n`)

  return true
}

async function main() {
  const tablesOk = await verifyTables()
  const triggerOk = await verifyTrigger()

  if (tablesOk && triggerOk) {
    console.log("=== All checks passed ===")
    process.exit(0)
  } else {
    console.log("=== Some checks failed ===")
    process.exit(1)
  }
}

main()
