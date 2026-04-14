import type { Database } from "./database.types"

/** Shorthand to extract the Row type of a catalog table. */
export type CatalogTables<T extends keyof Database["catalog"]["Tables"]> =
  Database["catalog"]["Tables"][T]["Row"]
