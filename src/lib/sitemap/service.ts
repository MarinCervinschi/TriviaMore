import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { classes, courseClasses, courses, departments, sections } from "@/db/schema";

type SitemapEntry = {
	loc: string;
	changefreq: string;
	priority: string;
};

// The sitemap spec requires entity encoding inside <loc>.
function xmlEscape(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export async function buildSitemap(): Promise<string> {
	const siteUrl = process.env.VITE_SITE_URL;
	if (!siteUrl) throw new Error("VITE_SITE_URL is not set");

	const db = getDb();

	const entries: SitemapEntry[] = [
		{ loc: "/", changefreq: "weekly", priority: "1.0" },
		{ loc: "/about", changefreq: "monthly", priority: "0.5" },
		{ loc: "/contact", changefreq: "monthly", priority: "0.5" },
		{ loc: "/browse", changefreq: "weekly", priority: "0.9" },
	];

	const [departmentRows, courseRows, classRows, sectionRows] = await Promise.all([
		db.select({ code: departments.code }).from(departments),
		db
			.select({ code: courses.code, departmentCode: departments.code })
			.from(courses)
			.innerJoin(departments, eq(departments.id, courses.departmentId)),
		db
			.select({
				code: courseClasses.code,
				courseCode: courses.code,
				departmentCode: departments.code,
			})
			.from(courseClasses)
			.innerJoin(courses, eq(courses.id, courseClasses.courseId))
			.innerJoin(departments, eq(departments.id, courses.departmentId)),
		// A section is listed under every course its class belongs to, so this
		// joins through the junction rather than resolving a primary course.
		db
			.select({
				name: sections.name,
				slug: sections.slug,
				classCode: courseClasses.code,
				courseCode: courses.code,
				departmentCode: departments.code,
			})
			.from(sections)
			.innerJoin(classes, eq(classes.id, sections.classId))
			.innerJoin(courseClasses, eq(courseClasses.classId, classes.id))
			.innerJoin(courses, eq(courses.id, courseClasses.courseId))
			.innerJoin(departments, eq(departments.id, courses.departmentId))
			.where(eq(sections.isPublic, true)),
	]);

	for (const department of departmentRows) {
		entries.push({
			loc: `/browse/${department.code.toLowerCase()}`,
			changefreq: "weekly",
			priority: "0.8",
		});
	}

	for (const course of courseRows) {
		entries.push({
			loc: `/browse/${course.departmentCode.toLowerCase()}/${course.code.toLowerCase()}`,
			changefreq: "weekly",
			priority: "0.7",
		});
	}

	for (const cls of classRows) {
		entries.push({
			loc: `/browse/${cls.departmentCode.toLowerCase()}/${cls.courseCode.toLowerCase()}/${cls.code.toLowerCase()}`,
			changefreq: "weekly",
			priority: "0.6",
		});
	}

	for (const section of sectionRows) {
		if (/exam/i.test(section.name) || !section.slug) continue;
		entries.push({
			loc: `/browse/${section.departmentCode.toLowerCase()}/${section.courseCode.toLowerCase()}/${section.classCode.toLowerCase()}/${section.slug}`,
			changefreq: "weekly",
			priority: "0.6",
		});
	}

	const today = new Date().toISOString().split("T")[0];

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		entry => `  <url>
    <loc>${xmlEscape(`${siteUrl}${entry.loc}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;
}
