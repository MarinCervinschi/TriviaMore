import { getCatalogAdmin } from "@/lib/supabase/admin"

type SitemapEntry = {
  loc: string
  changefreq: string
  priority: string
}

const PAGE_SIZE = 1000

async function fetchAll<T>(
  fn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []
  let offset = 0
  for (;;) {
    const { data, error } = await fn(offset, offset + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return rows
}

// The sitemap spec requires entity encoding inside <loc>.
function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function buildSitemap(): Promise<string> {
  const siteUrl = process.env.VITE_SITE_URL
  if (!siteUrl) throw new Error("VITE_SITE_URL is not set")

  const catalog = getCatalogAdmin()

  const entries: SitemapEntry[] = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/browse", changefreq: "weekly", priority: "0.9" },
  ]

  const departments = await fetchAll<{ code: string }>((from, to) =>
    catalog.from("departments").select("code").range(from, to),
  )
  for (const dept of departments) {
    entries.push({
      loc: `/browse/${dept.code.toLowerCase()}`,
      changefreq: "weekly",
      priority: "0.8",
    })
  }

  const courses = await fetchAll<{ code: string; departments: { code: string } }>(
    (from, to) =>
      catalog.from("courses").select("code, departments!inner(code)").range(from, to),
  )
  for (const course of courses) {
    entries.push({
      loc: `/browse/${course.departments.code.toLowerCase()}/${course.code.toLowerCase()}`,
      changefreq: "weekly",
      priority: "0.7",
    })
  }

  const courseClasses = await fetchAll<{
    code: string
    course: { code: string; department: { code: string } }
  }>((from, to) =>
    catalog
      .from("course_classes")
      .select("code, course:courses!inner(code, department:departments!inner(code))")
      .range(from, to),
  )
  for (const cc of courseClasses) {
    entries.push({
      loc: `/browse/${cc.course.department.code.toLowerCase()}/${cc.course.code.toLowerCase()}/${cc.code.toLowerCase()}`,
      changefreq: "weekly",
      priority: "0.6",
    })
  }

  const sections = await fetchAll<{
    name: string
    slug: string
    class: {
      course_classes: Array<{
        code: string
        course: { code: string; department: { code: string } }
      }>
    }
  }>((from, to) =>
    catalog
      .from("sections")
      .select(
        "name, slug, class:classes!inner(course_classes(code, course:courses!inner(code, department:departments!inner(code))))",
      )
      .eq("is_public", true)
      .range(from, to),
  )
  for (const section of sections) {
    if (/exam/i.test(section.name)) continue
    for (const cc of section.class.course_classes) {
      entries.push({
        loc: `/browse/${cc.course.department.code.toLowerCase()}/${cc.course.code.toLowerCase()}/${cc.code.toLowerCase()}/${section.slug}`,
        changefreq: "weekly",
        priority: "0.6",
      })
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${e.loc}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`
}
