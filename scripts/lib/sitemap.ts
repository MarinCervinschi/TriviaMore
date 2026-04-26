import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

type SitemapEntry = {
  loc: string
  changefreq: string
  priority: string
}

const PAGE_SIZE = 1000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAll(fn: (from: number, to: number) => PromiseLike<{ data: any; error: any }>) {
  const rows: unknown[] = []
  let offset = 0
  while (true) {
    const { data, error } = await fn(offset, offset + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return rows
}

export async function generateSitemap() {
  const SITE_URL = process.env.VITE_SITE_URL
  if (!SITE_URL) {
    throw new Error("VITE_SITE_URL is not defined in environment variables.")
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ).schema("catalog")

  const entries: SitemapEntry[] = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/browse", changefreq: "weekly", priority: "0.9" },
  ]

  const departments = await fetchAll((from, to) =>
    supabase.from("departments").select("code").range(from, to),
  ) as Array<{ code: string }>
  for (const dept of departments) {
    entries.push({
      loc: `/browse/${dept.code.toLowerCase()}`,
      changefreq: "weekly",
      priority: "0.8",
    })
  }

  const courses = await fetchAll((from, to) =>
    supabase.from("courses").select("code, departments!inner(code)").range(from, to),
  ) as Array<{ code: string; departments: { code: string } }>
  for (const course of courses) {
    entries.push({
      loc: `/browse/${course.departments.code.toLowerCase()}/${course.code.toLowerCase()}`,
      changefreq: "weekly",
      priority: "0.7",
    })
  }

  const courseClasses = await fetchAll((from, to) =>
    supabase.from("course_classes").select("code, course:courses!inner(code, department:departments!inner(code))").range(from, to),
  ) as Array<{ code: string; course: { code: string; department: { code: string } } }>
  for (const cc of courseClasses) {
    entries.push({
      loc: `/browse/${cc.course.department.code.toLowerCase()}/${cc.course.code.toLowerCase()}/${cc.code.toLowerCase()}`,
      changefreq: "weekly",
      priority: "0.6",
    })
  }

  const sections = await fetchAll((from, to) =>
    supabase.from("sections")
      .select("name, class:classes!inner(course_classes(code, course:courses!inner(code, department:departments!inner(code))))")
      .eq("is_public", true)
      .range(from, to),
  ) as Array<{
    name: string
    class: { course_classes: Array<{ code: string; course: { code: string; department: { code: string } } }> }
  }>
  for (const section of sections) {
    if (/exam/i.test(section.name)) continue
    // Mirror the slug logic used by the section Link in the class route.
    const slug = section.name.replace(/ /g, "-").toLowerCase()
    for (const cc of section.class.course_classes) {
      entries.push({
        loc: `/browse/${cc.course.department.code.toLowerCase()}/${cc.course.code.toLowerCase()}/${cc.code.toLowerCase()}/${slug}`,
        changefreq: "weekly",
        priority: "0.6",
      })
    }
  }

  const today = new Date().toISOString().split("T")[0]
  // Sitemap spec requires URL entity encoding inside <loc>.
  const xmlEscape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${xmlEscape(`${SITE_URL}${e.loc}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  const outPath = resolve(import.meta.dirname, "../../public/sitemap.xml")
  writeFileSync(outPath, xml, "utf-8")
  console.log(`Sitemap generated with ${entries.length} URLs at ${outPath}`)
}
