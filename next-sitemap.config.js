/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: "https://www.trivia-more.it",
	generateRobotsTxt: true,
	sitemapSize: 7000,
	exclude: ["/user/*", "/api/*", "/quiz/*", "/flashcard/*"],
};
