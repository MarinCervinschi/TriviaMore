/**
 * The public URLs of the catalogue, in one place. Pure string work, so this file
 * is safe on both sides: `catalog/service.ts` reaches `getDb` and cannot be
 * imported from a component, and a breadcrumb needs the same routes a query does.
 *
 * Every level returns null when the chain above it is incomplete — a class that
 * hangs off no course has no browse route to point at.
 */
export type CatalogChain = {
	departmentCode?: string | null;
	courseCode?: string | null;
	classCode?: string | null;
	sectionSlug?: string | null;
};

export function departmentBrowsePath(chain: CatalogChain): string | null {
	if (!chain.departmentCode) return null;
	return `/browse/${chain.departmentCode.toLowerCase()}`;
}

export function courseBrowsePath(chain: CatalogChain): string | null {
	const department = departmentBrowsePath(chain);
	if (!department || !chain.courseCode) return null;
	return `${department}/${chain.courseCode.toLowerCase()}`;
}

export function classBrowsePath(chain: CatalogChain): string | null {
	const course = courseBrowsePath(chain);
	if (!course || !chain.classCode) return null;
	return `${course}/${chain.classCode.toLowerCase()}`;
}

export function sectionBrowsePath(
	chain: CatalogChain | null | undefined
): string | null {
	if (!chain) return null;
	const parent = classBrowsePath(chain);
	if (!parent || !chain.sectionSlug) return null;
	return `${parent}/${chain.sectionSlug}`;
}
