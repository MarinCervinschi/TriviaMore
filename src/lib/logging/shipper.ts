import { type LogEvent, render, toClef } from "./clef";

// Nothing here may block a request or throw into one.

const FLUSH_MS = 2_000;
const MAX_BATCH_EVENTS = 100;
const MAX_BATCH_BYTES = 256_000;
// Dropping past these caps keeps a Seq outage from becoming an OOM.
const MAX_QUEUE_EVENTS = 10_000;
const MAX_QUEUE_BYTES = 10_000_000;
const SEND_TIMEOUT_MS = 10_000;
const FAILURE_REPORT_MS = 30_000;

type Target = { url: string; apiKey: string | undefined };

let target: Target | null | undefined;
let queue: string[] = [];
let queueBytes = 0;
let dropped = 0;
let lost = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let lastFailureAt = 0;
let hooked = false;

// `null` means no SEQ_URL, so events go to the console.
function resolveTarget(): Target | null {
	if (target !== undefined) return target;
	const base = process.env.SEQ_URL?.trim();
	target = base
		? {
				url: `${base.replace(/\/+$/, "")}/ingest/clef`,
				// A service that shares the app's Infisical secrets gets its own key under a name Infisical does not overwrite.
				apiKey: (process.env.SEQ_SERVICE_API_KEY ?? process.env.SEQ_API_KEY)?.trim(),
			}
		: null;
	return target;
}

function writeToConsole(event: LogEvent): void {
	const message = `[${event.level}] ${render(event.template, event.properties)}`;
	const detail =
		event.error === undefined
			? ""
			: `\n${event.error instanceof Error ? (event.error.stack ?? event.error.message) : String(event.error)}`;
	if (event.level === "Error") console.error(message + detail);
	else if (event.level === "Warning") console.warn(message + detail);
	else console.log(message + detail);
}

function reportFailure(reason: string, count: number): void {
	lost += count;
	const now = Date.now();
	if (now - lastFailureAt < FAILURE_REPORT_MS) return;
	lastFailureAt = now;
	console.warn(`[log] Seq ingestion failed (${reason}); dropped ${lost} events`);
	lost = 0;
}

function scheduleFlush(): void {
	if (timer) return;
	// Unref'd so a finished script still exits; `beforeExit` flushes the rest.
	timer = setTimeout(() => void flush(), FLUSH_MS);
	timer.unref?.();
}

function lineBytes(line: string): number {
	return Buffer.byteLength(line) + 1;
}

// At least one line, so a line larger than a batch still goes out on its own.
function takeBatch(): string[] {
	let count = 0;
	let bytes = 0;
	while (count < queue.length && count < MAX_BATCH_EVENTS) {
		const size = lineBytes(queue[count]!);
		if (count > 0 && bytes + size > MAX_BATCH_BYTES) break;
		bytes += size;
		count += 1;
	}
	queueBytes -= bytes;
	return queue.splice(0, count);
}

// A failed batch is discarded, because requeueing against a Seq that is down grows the queue until the process dies.
async function send(destination: Target, batch: string[]): Promise<boolean> {
	try {
		const response = await fetch(destination.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/vnd.serilog.clef",
				...(destination.apiKey ? { "X-Seq-ApiKey": destination.apiKey } : {}),
			},
			body: batch.join("\n"),
			signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
		});
		if (response.ok) return true;
		reportFailure(`${response.status} ${response.statusText}`, batch.length);
	} catch (error) {
		reportFailure(error instanceof Error ? error.message : String(error), batch.length);
	}
	return false;
}

export async function flush(): Promise<void> {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
	if (flushing || queue.length === 0) return;

	const destination = resolveTarget();
	if (!destination) return;

	flushing = true;
	try {
		while (queue.length > 0) {
			const delivered = await send(destination, takeBatch());
			if (delivered && dropped > 0) {
				console.warn(`[log] dropped ${dropped} events: queue full`);
				dropped = 0;
			}
		}
	} finally {
		flushing = false;
		if (queue.length > 0) scheduleFlush();
	}
}

function hookShutdown(): void {
	if (hooked) return;
	hooked = true;

	for (const signal of ["SIGTERM", "SIGINT"] as const) {
		process.once(signal, () => {
			// Re-raised after the flush, or the container hangs on every redeploy.
			void flush().finally(() => process.kill(process.pid, signal));
		});
	}

	// Scripts exit when the event loop empties, which no signal covers.
	process.once("beforeExit", () => void flush());
}

export function ship(event: LogEvent): void {
	const destination = resolveTarget();
	if (!destination) {
		writeToConsole(event);
		return;
	}

	hookShutdown();

	if (queue.length >= MAX_QUEUE_EVENTS) {
		dropped += 1;
		return;
	}

	const line = toClef(event);
	const size = lineBytes(line);
	if (queueBytes + size > MAX_QUEUE_BYTES) {
		dropped += 1;
		return;
	}
	queue.push(line);
	queueBytes += size;

	if (queue.length >= MAX_BATCH_EVENTS || queueBytes >= MAX_BATCH_BYTES) {
		void flush();
		return;
	}
	scheduleFlush();
}
