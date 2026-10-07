import { PgBoss } from "pg-boss";

import { log } from "@/lib/logging/server";

/** The payload of a queued job: everything else lives on the run's row in ops.job_runs. */
export type QueuedRun = { runId: string };

export const QUEUE_OPTIONS = {
	policy: "singleton",
	retryLimit: 0,
	expireInSeconds: 60 * 60,
} as const;

let sender: Promise<PgBoss> | undefined;

/** A pg-boss instance that only sends, for the console's server: the worker owns maintenance and cron. */
export function queueSender(): Promise<PgBoss> {
	sender ??= (async () => {
		const url = process.env.STAGING_DATABASE_URL;
		if (!url) throw new Error("STAGING_DATABASE_URL non è configurata.");
		const boss = new PgBoss({
			connectionString: url,
			migrate: false,
			supervise: false,
			schedule: false,
			useListenNotify: false,
			max: 2,
		});
		boss.on("error", error => log.error("Job queue error", {}, error));
		return boss.start();
	})();
	return sender;
}
