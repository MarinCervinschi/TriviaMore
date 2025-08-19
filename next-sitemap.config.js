const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAllDepartments() {
	return await prisma.department.findMany({
		select: {
			code: true,
			updatedAt: true,
		},
		orderBy: { position: "asc" },
	});
}

async function getAllCourses() {
	return await prisma.course.findMany({
		select: {
			code: true,
			updatedAt: true,
			department: {
				select: {
					code: true,
				},
			},
		},
		orderBy: { position: "asc" },
	});
}

async function getAllClasses() {
	return await prisma.class.findMany({
		select: {
			code: true,
			updatedAt: true,
			course: {
				select: {
					code: true,
					department: {
						select: {
							code: true,
						},
					},
				},
			},
		},
		orderBy: { position: "asc" },
	});
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: "https://trivia-more.it",
	generateRobotsTxt: true,
	sitemapSize: 7000,
	exclude: ["/user/*", "/api/*", "/quiz/*", "/flashcard/*"],

	additionalPaths: async () => {
		const [depts, courses, classes] = await Promise.all([
			getAllDepartments(),
			getAllCourses(),
			getAllClasses(),
		]);

		depts.forEach(dept => {
			dept.code = dept.code.toLowerCase();
		});

		courses.forEach(course => {
			course.code = course.code.toLowerCase();
			course.department.code = course.department.code.toLowerCase();
		});

		classes.forEach(cls => {
			cls.code = cls.code.toLowerCase();
			cls.course.code = cls.course.code.toLowerCase();
			cls.course.department.code = cls.course.department.code.toLowerCase();
		});

		const paths = [
			...depts.map(d => ({
				loc: `/browse/${d.code}`,
				lastmod: d.updatedAt.toISOString(),
				priority: 0.8,
			})),

			...courses.map(c => ({
				loc: `/browse/${c.department.code}/${c.code}`,
				lastmod: c.updatedAt.toISOString(),
				priority: 0.9,
			})),

			...classes.map(c => ({
				loc: `/browse/${c.course.department.code}/${c.course.code}/${c.code}`,
				lastmod: c.updatedAt.toISOString(),
				priority: 1.0,
			})),
		];

		return paths;
	},
};
