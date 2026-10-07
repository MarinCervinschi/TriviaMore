import { catalogSyllabi, catalogSync } from "./catalog";
import type { JobDefinition } from "./types";

/** Every job the worker serves; the worker creates a missing queue when it starts. */
export const JOBS: JobDefinition[] = [catalogSync, catalogSyllabi];

export function jobByName(name: string): JobDefinition | undefined {
	return JOBS.find(job => job.name === name);
}
