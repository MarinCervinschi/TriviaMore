import { z } from "zod";

/**
 * The search-param fields a URL-backed data table reads. Spread into the
 * route's `validateSearch` schema, then add one `dataTableFilterField` per
 * faceted column, keyed by the column id.
 */
export const dataTableSearchFields = {
	q: z.string().optional().catch(undefined),
	page: z.coerce.number().int().min(1).optional().catch(undefined),
	sort: z.string().optional().catch(undefined),
	dir: z.enum(["asc", "desc"]).optional().catch(undefined),
};

export const dataTableFilterField = z.string().optional().catch(undefined);
