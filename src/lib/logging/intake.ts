const WINDOW_MS = 60_000;
const MAX_TRACKED_IPS = 10_000;

export const LOG_INTAKE_LIMITS = {
	batchesPerIp: 60,
	bytesPerIp: 512 * 1024,
	batchesTotal: 3_000,
	bytesTotal: 16 * 1024 * 1024,
};

type Bucket = { batches: number; bytes: number; windowStart: number };

/** Per-IP and global budgets of batches and bytes, each over a one-minute window. */
export function createLogIntake(limits = LOG_INTAKE_LIMITS) {
	// The IP is a rate-limit key only and is never logged.
	const buckets = new Map<string, Bucket>();
	let total: Bucket = { batches: 0, bytes: 0, windowStart: 0 };

	function fresh(now: number): Bucket {
		return { batches: 0, bytes: 0, windowStart: now };
	}

	function bucketFor(ip: string, now: number): Bucket {
		const bucket = buckets.get(ip);
		if (bucket && now - bucket.windowStart < WINDOW_MS) return bucket;
		if (buckets.size >= MAX_TRACKED_IPS) {
			for (const [key, old] of buckets) {
				if (now - old.windowStart >= WINDOW_MS) buckets.delete(key);
			}
			if (buckets.size >= MAX_TRACKED_IPS) buckets.clear();
		}
		const created = fresh(now);
		buckets.set(ip, created);
		return created;
	}

	/** Counts a batch of `bytes` from `ip`; false once a budget for this window is spent. */
	return function admit(ip: string, bytes: number, now = Date.now()): boolean {
		if (now - total.windowStart >= WINDOW_MS) total = fresh(now);
		const bucket = bucketFor(ip, now);

		bucket.batches += 1;
		bucket.bytes += bytes;
		total.batches += 1;
		total.bytes += bytes;

		return (
			bucket.batches <= limits.batchesPerIp &&
			bucket.bytes <= limits.bytesPerIp &&
			total.batches <= limits.batchesTotal &&
			total.bytes <= limits.bytesTotal
		);
	};
}
