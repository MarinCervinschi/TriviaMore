import { jobTexts } from "@/db/schema";

import { consoleDb } from "~/lib/db/client";

import { JOBS, jobByName } from "../registry";
import type { JobInfo, SaveJobTextsResult } from "../types";

/** Every job, with the name and description the owner gave it over the ones in its code. */
export async function listJobs(): Promise<JobInfo[]> {
	const texts = new Map(
		(await consoleDb().select().from(jobTexts)).map(row => [row.job, row])
	);
	return JOBS.map(
		({ name, label, description, area, simulates, command, terminal, fields }) => {
			const text = texts.get(name);
			return {
				name,
				label: text?.label ?? label,
				description: text?.description ?? description,
				original: { label, description },
				area,
				simulates,
				command,
				terminal,
				fields,
			};
		}
	);
}

/** Saves the job's name and description; a text equal to the code's, or empty, goes back to the code's. */
export async function saveJobTexts(
	input: { job: string; label: string; description: string },
	updatedBy: string
): Promise<SaveJobTextsResult> {
	const job = jobByName(input.job);
	if (!job) return { success: false, error: "Job sconosciuto." };
	const own = (value: string, original: string) => {
		const trimmed = value.trim();
		return trimmed === "" || trimmed === original ? null : trimmed;
	};
	const values = {
		label: own(input.label, job.label),
		description: own(input.description, job.description),
		updatedBy,
		updatedAt: new Date().toISOString(),
	};
	await consoleDb()
		.insert(jobTexts)
		.values({ job: job.name, ...values })
		.onConflictDoUpdate({ target: jobTexts.job, set: values });
	return { success: true };
}
