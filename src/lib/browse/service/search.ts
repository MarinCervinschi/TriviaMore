import { type SQL, and, or, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import type { DbOrTx } from "@/db";
import { classes, courses } from "@/db/schema";
import { normaliseCatalogueCode } from "@/lib/catalog/codes";

// The only module that knows search runs on ParadeDB: the indexes are in drizzle/0004_bm25_search.sql.

/** Words of the query with anything but letters and digits dropped, so `"analisi,` reads `analisi`. */
export function searchTerms(input: string): string[] {
	return input
		.trim()
		.split(/\s+/)
		.map(term => term.replace(/[^\p{L}\p{N}]/gu, ""))
		.filter(Boolean);
}

// One edit forgives a typo; on a word of three letters or fewer it would match nearly everything.
const fuzzyDistance = (term: string) => (term.length > 3 ? 1 : 0);

/** Every term matches a word of the column, by prefix and with a typo allowed. */
function allTermsFuzzy(column: PgColumn, terms: string[]): SQL {
	return and(
		...terms.map(
			term =>
				sql`${column} ||| ${term}::pdb.fuzzy(${sql.raw(String(fuzzyDistance(term)))}, t, t)`
		)
	)!;
}

/** Fuzzy matches score a constant, so the exact match is what ranks a document by BM25. */
function nameMatch(column: PgColumn, terms: string[]): SQL {
	return or(
		sql`${column} &&& ${terms.join(" ")}::pdb.boost(2)`,
		allTermsFuzzy(column, terms)
	)!;
}

/** Courses matching the text by name or by code, with their relevance; null when the text has no terms. */
export function matchingCourses(db: DbOrTx, input: string) {
	const terms = searchTerms(input);
	if (terms.length === 0) return null;
	const code = normaliseCatalogueCode(input).toLowerCase();
	return db
		.select({
			id: courses.id,
			score: sql<number>`pdb.score(${courses.id})`.as("score"),
		})
		.from(courses)
		.where(
			or(
				nameMatch(courses.name, terms),
				sql`${courses.code} ||| ${code}::pdb.boost(4)`,
				sql`${courses.code} @@@ pdb.phrase_prefix(ARRAY[${code}])`
			)
		)
		.as("course_matches");
}

/** Classes matching the text by name, with their relevance; null when the text has no terms. */
export function matchingClasses(db: DbOrTx, input: string) {
	const terms = searchTerms(input);
	if (terms.length === 0) return null;
	return db
		.select({
			id: classes.id,
			score: sql<number>`pdb.score(${classes.id})`.as("score"),
		})
		.from(classes)
		.where(nameMatch(classes.name, terms))
		.as("class_matches");
}
