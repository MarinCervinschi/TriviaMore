import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { loadSecrets } from "../src/lib/secrets/server"

// Load secrets from Infisical SDK if available (prod), otherwise assume env is already set (CLI)
await loadSecrets()

const SITE_URL = process.env.VITE_SITE_URL ?? "https://triviamore.it"

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

type SitemapEntry = {
  loc: string
  changefreq: string
  priority: string
}

async function generateSitemap() {
  const entries: SitemapEntry[] = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/browse", changefreq: "weekly", priority: "0.9" },
  ]

  // Departments
  const { data: departments } = await supabase
    .from("departments")
    .select("code")
  for (const dept of departments ?? []) {
    entries.push({
      loc: `/browse/${dept.code}`,
      changefreq: "weekly",
      priority: "0.8",
    })
  }

  // Courses (with department code)
  const { data: courses } = await supabase
    .from("courses")
    .select("code, departments!inner(code)")
  for (const course of courses ?? []) {
    const deptCode = (course.departments as unknown as { code: string }).code
    entries.push({
      loc: `/browse/${deptCode}/${course.code}`,
      changefreq: "weekly",
      priority: "0.7",
    })
  }

  // Classes (with course and department codes)
  const { data: classes } = await supabase
    .from("classes")
    .select("code, courses!inner(code, departments!inner(code))")
  for (const cls of classes ?? []) {
    const course = cls.courses as unknown as {
      code: string
      departments: { code: string }
    }
    entries.push({
      loc: `/browse/${course.departments.code}/${course.code}/${cls.code}`,
      changefreq: "weekly",
      priority: "0.6",
    })
  }

  // Sections (public only, with full hierarchy)
  const { data: sections } = await supabase
    .from("sections")
    .select(
      "slug, is_private, classes!inner(code, courses!inner(code, departments!inner(code)))",
    )
    .eq("is_private", false)
  for (const section of sections ?? []) {
    const cls = section.classes as unknown as {
      code: string
      courses: { code: string; departments: { code: string } }
    }
    entries.push({
      loc: `/browse/${cls.courses.departments.code}/${cls.courses.code}/${cls.code}/${section.slug}`,
      changefreq: "weekly",
      priority: "0.6",
    })
  }

  const today = new Date().toISOString().split("T")[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  const outPath = resolve(import.meta.dirname, "../public/sitemap.xml")
  writeFileSync(outPath, xml, "utf-8")
  console.log(
    `Sitemap generated with ${entries.length} URLs at ${outPath}`,
  )
}

generateSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err)
  process.exit(1)
})
