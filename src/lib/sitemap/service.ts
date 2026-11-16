import { and, eq, exists, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
	classes,
	courseClasses,
	courses,
	departments,
	questions,
	sections,
} from "@/db/schema";
import {
	primaryCourseByClass,
	studiableCourseClassSql,
} from "@/lib/catalog/db/course-classes";
import { classBrowsePath } from "@/lib/catalog/paths";

type SitemapEntry = {
	loc: string;
	changefreq: string;
	priority: string;
	lastmod?: string;
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
	const primary = primaryCourseByClass(db);
	const primaryChain = {
		departmentCode: primary.departmentCode,
		courseCode: primary.courseCode,
		classCode: primary.classCode,
	};

	const entries: SitemapEntry[] = [
		{ loc: "/", changefreq: "weekly", priority: "1.0" },
		{ loc: "/about", changefreq: "monthly", priority: "0.5" },
		{ loc: "/contact", changefreq: "monthly", priority: "0.5" },
		{ loc: "/browse", changefreq: "weekly", priority: "0.9" },
	];

	const [departmentRows, courseRows, classRows, sectionRows] = await Promise.all([
		db
			.select({ code: departments.code, updatedAt: departments.updatedAt })
			.from(departments),
		db
			.select({
				code: courses.code,
				departmentCode: departments.code,
				updatedAt: courses.updatedAt,
			})
			.from(courses)
			.innerJoin(departments, eq(departments.id, courses.departmentId)),
		// One entry per class, under its primary course: the path every copy declares as canonical.
		db
			.select({ ...primaryChain, updatedAt: classes.updatedAt })
			.from(primary)
			.innerJoin(classes, eq(classes.id, primary.classId))
			.where(
				exists(
					db
						.select({ one: sql`1` })
						.from(courseClasses)
						.where(
							and(
								eq(courseClasses.classId, primary.classId),
								studiableCourseClassSql(db)
							)
						)
				)
			),
		db
			.select({
				...primaryChain,
				name: sections.name,
				slug: sections.slug,
				updatedAt: sql<string>`to_char(greatest(${sections.updatedAt}, (select max(${questions.updatedAt}) from ${questions} where ${questions.sectionId} = ${sections.id})), 'YYYY-MM-DD')`,
			})
			.from(sections)
			.innerJoin(primary, eq(primary.classId, sections.classId))
			.where(eq(sections.isPublic, true)),
	]);

	for (const department of departmentRows) {
		entries.push({
			loc: `/browse/${department.code.toLowerCase()}`,
			changefreq: "weekly",
			priority: "0.8",
			lastmod: department.updatedAt,
		});
	}

	for (const course of courseRows) {
		entries.push({
			loc: `/browse/${course.departmentCode.toLowerCase()}/${course.code.toLowerCase()}`,
			changefreq: "weekly",
			priority: "0.7",
			lastmod: course.updatedAt,
		});
	}

	for (const cls of classRows) {
		entries.push({
			loc: classBrowsePath(cls)!,
			changefreq: "weekly",
			priority: "0.6",
			lastmod: cls.updatedAt,
		});
	}

	for (const section of sectionRows) {
		if (/exam/i.test(section.name) || !section.slug) continue;
		entries.push({
			loc: `${classBrowsePath(section)}/${section.slug}`,
			changefreq: "weekly",
			priority: "0.6",
			lastmod: section.updatedAt,
		});
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		entry => `  <url>
    <loc>${xmlEscape(`${siteUrl}${entry.loc}`)}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod.slice(0, 10)}</lastmod>\n` : ""}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;
}
