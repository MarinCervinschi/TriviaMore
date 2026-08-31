import { getDb } from "@/db";
import { filterAccessibleSections } from "@/lib/auth/checks";

import { findSectionsInClass } from "./db/sections";

// Sections of a class the user is allowed to study, used by every "whole class"
// entry point: exam simulation and exam flashcards.
export async function accessibleSectionIdsInClass(
	userId: string | null,
	classId: string
): Promise<string[]> {
	const db = getDb();
	const all = await findSectionsInClass(db, classId);
	const allowed = await filterAccessibleSections(
		db,
		userId,
		all.map(section => section.id)
	);
	return all.filter(section => allowed.has(section.id)).map(s => s.id);
}
