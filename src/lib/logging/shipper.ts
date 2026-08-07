import { type LogEvent, render, toClef } from "./clef";

// Batching to Seq's CLEF endpoint. Nothing here may block a request or throw
// into one: a logging backend that is down has to cost log lines, never
// latency and never a 500.

const FLUSH_MS = 2_000;
const MAX_BATCH_EVENTS = 100;
const MAX_BATCH_BYTES = 256_000;
// Past this the process is holding more log data than Seq is accepting.
// Dropping is the only option that cannot turn an outage into an OOM.
const MAX_QUEUE_EVENTS = 10_000;
const FAILURE_REPORT_MS = 30_000;

type Target = { url: string; apiKey: string | undefined };

let target: Target | null | undefined;
let queue: string[] = [];
let queueBytes = 0;
let dropped = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let lastFailureAt = 0;
let hooked = false;

// `null` means no SEQ_URL, so events go to the console instead — the path
// contributors without Infisical run on.
function resolveTarget(): Target | null {
	if (target !== undefined) return target;
	const base = process.env.SEQ_URL?.trim();
	target = base
		? {
				url: `${base.replace(/\/+$/, "")}/ingest/clef`,
				apiKey: process.env.SEQ_API_KEY?.trim(),
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

function reportFailure(reason: string, lost: number): void {
	const now = Date.now();
	if (now - lastFailureAt < FAILURE_REPORT_MS) return;
	lastFailureAt = now;
	console.warn(`[log] Seq ingestion failed (${reason}); dropped ${lost} events`);
}

function scheduleFlush(): void {
	if (timer) return;
	// Unref'd so a script that has finished its work still exits; `beforeExit`
	// below is what actually gets those last events out.
	timer = setTimeout(() => void flush(), FLUSH_MS);
	timer.unref?.();
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
	const batch = queue;
	const droppedBefore = dropped;
	queue = [];
	queueBytes = 0;
	dropped = 0;

	try {
		const response = await fetch(destination.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/vnd.serilog.clef",
				...(destination.apiKey ? { "X-Seq-ApiKey": destination.apiKey } : {}),
			},
			body: batch.join("\n"),
		});
		if (!response.ok) {
			reportFailure(`${response.status} ${response.statusText}`, batch.length);
		} else if (droppedBefore > 0) {
			console.warn(`[log] dropped ${droppedBefore} events: queue full`);
		}
	} catch (error) {
		// A failed batch is discarded rather than requeued: retrying a backlog
		// against a Seq that is down grows the queue until the process dies.
		reportFailure(error instanceof Error ? error.message : String(error), batch.length);
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
			// Re-raised after the flush so the default disposition still applies —
			// `once` has already removed this listener by then. Swallowing the signal
			// would leave the container hanging on every redeploy.
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
	queue.push(line);
	queueBytes += line.length;

	if (queue.length >= MAX_BATCH_EVENTS || queueBytes >= MAX_BATCH_BYTES) {
		void flush();
		return;
	}
	scheduleFlush();
}
