# Observability

Structured logs go to a self-hosted **Seq** instance. There is no metrics stack and no tracing
backend: one Node process and one Postgres do not need one, and a canonical log line with a duration
answers the same questions.

## How it works

`src/lib/logging/` writes events in **CLEF** (Compact Log Event Format) and POSTs newline-delimited
batches to `{SEQ_URL}/ingest/clef`.

```
src/lib/logging/clef.ts      event → CLEF line, redaction, error formatting
src/lib/logging/context.ts   AsyncLocalStorage: trace id, source, user, db counters
src/lib/logging/shipper.ts   batching, POST, drop on overflow, flush on shutdown
src/lib/logging/server.ts    the log API — `log.debug/info/warn/error`
```

`observabilityMiddleware` in `src/lib/server/middleware/observability.ts` is registered as a
**request** middleware in `src/start.ts`. It opens the trace, so it covers page renders *and* server
functions — including the ones a page calls during SSR, which share its trace id because Start
invokes them directly rather than over HTTP.

### Why not OpenTelemetry

OTel auto-instrumentation patches modules at load time and needs `node --import` plus **unbundled**
modules. Nitro inlines `pg` into `.output/server/index.mjs`, so `@opentelemetry/instrumentation-pg`
would patch nothing, silently. Pino is out for the same class of reason: its transports spawn a
worker thread that resolves the transport module by path at runtime, which does not exist inside the
Rollup bundle.

Both are fixable and neither is worth it yet. The door stays open: CLEF models spans natively
(`@sp`, `@ps`, `@st`, `@sk`), Seq ingests OTLP at `/ingest/otlp/v1/traces` and
`/ingest/otlp/v1/logs`, and the trace id is already W3C-shaped — so swapping the shipper for an OTLP
exporter would not change the data model. Revisit when a second service appears.

## The canonical log line

One rich event per request instead of a handful of scattered ones. It is the backbone: most
questions are answered by querying it alone, and it keeps volume low enough that Seq stays fast.

```
{"@t":"2026-08-02T21:22:41.113Z","@l":"Information","@mt":"{Fn} → {Outcome} in {Elapsed:0.0}ms",
 "@tr":"4bf92f35…","Source":"fn","UserId":"9f1c…","Version":"68016aa","Method":"POST",
 "Path":"/_serverFn/startQuizFn","Status":200,"Elapsed":84.2,"Outcome":"ok","Fn":"startQuizFn",
 "DbQueries":6,"DbMs":41.8}
```

Server functions and page renders use two different templates on purpose, so Seq groups them as
distinct event types.

## Properties

| Property | Values |
|---|---|
| `Environment` | `preview` \| `production` — **attached by the Seq API key**, never set in code |
| `Source` | `ssr` \| `fn` \| `job` (`browser` once client reporting lands) |
| `Version` | commit sha, from Coolify's runtime `SOURCE_COMMIT` (or `APP_VERSION` off Coolify) |
| `@tr` | 32-hex trace id, shared by every event in one request |
| `UserId` | uuid only — attached by the auth guards |
| `Outcome` | `ok` \| `rejected` (an AppError) \| `failed` (a bug) |
| `ErrorCode` | the AppError code, or the Postgres SQLSTATE |
| `DbQueries` / `DbMs` | accumulated by the pool wrapper |

## Levels

Decide the level from *who needs to act*, not from how bad the words sound.

| Level | Meaning |
|---|---|
| `Error` | a human needs to look — an unhandled exception, the database down, mail refused |
| `Warning` | degraded but handled — a slow query, a saturated pool, dropped log events |
| `Information` | the canonical line, auth events, admin mutations |
| `Debug` | every database query; off in production, enabled with `LOG_LEVEL=debug` |

**`Forbidden` and `NotFound` are not errors.** They are expected outcomes and land in `Outcome` on
the canonical line, which is why `errorMiddleware` never logs an `AppError` at `Error` level.

## Writing a log call

```ts
import { log } from "@/lib/logging/server"

log.info("Imported {Count} questions into {SectionId}", { Count: rows.length, SectionId: id })
log.error("Mail delivery failed for {Kind}", { Kind: "request-approved" }, err)
```

Rules, in order of how much damage breaking them does:

1. **A message template, never interpolation.** `log.info("… {Count} …", { Count: n })`, not
   `` log.info(`… ${n} …`) ``. Seq indexes properties, so `Count > 100` is a real query — an
   interpolated string throws that away and leaves you grepping.
2. **Never a whole object.** `log.info("…", { user })` is how emails leak. Pass `userId`. The
   serializer redacts on a key denylist as a safety net, not as a licence.
3. **Log at boundaries.** Requests, database queries, external calls (Supabase auth, nodemailer,
   Storage). Inside a service, log a genuine decision or an anomaly — nothing that can be
   reconstructed from the boundary events.
4. **Do not log and rethrow.** `errorMiddleware` logs once, at the boundary. A service that also
   logs produces duplicates and inflates the error count.
5. **PascalCase property names**, matching the `{Placeholder}` in the template.
6. **Never import `@/lib/logging/server` from a component.** It reaches `node:async_hooks`. The
   build check below is what catches a mistake here.

## What never reaches Seq

Emails, passwords, tokens, cookies, `Authorization` headers, service keys, question and answer text,
and **query parameter values** — the pool wrapper logs SQL text only. A Postgres error contributes
its `code` and `constraint`; `detail` is dropped because it quotes the offending row.

Users are identified by uuid. IP addresses are personal data: they are not logged today, and adding
them would mean saying so in the privacy policy.

## Configuration

| Variable | Effect |
|---|---|
| `SEQ_URL` | ingestion base URL, no path. **Unset → events print to the console instead**, which is what contributors without Infisical get |
| `SEQ_API_KEY` | Seq API key, one per environment |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error`; defaults to `info` |
| `APP_VERSION` | commit sha, **only needed off Coolify** — see below; omitted from events when unset |

Coolify injects `SOURCE_COMMIT` into the container at runtime and the logger reads it, so `Version`
needs no configuration there. It is deliberately *not* taken as a build argument: Coolify keeps
`SOURCE_COMMIT` out of builds by default because a value that changes every commit invalidates the
layer cache, and this build already costs enough. Confirm it is arriving with
`docker exec <container> printenv SOURCE_COMMIT`.

### Seq setup

One API key per environment, **Data → Ingestion → Add API key**:

- **Attached properties**: `Environment` = `preview` / `production`. Setting it on the key rather
  than in code means the app cannot mislabel its own environment.
- **Permissions**: `Ingest` only.
- **Server timestamps**: leave unchecked — it would overwrite `@t` with arrival time and hide the
  real latency inside a batch.
- **Logging level**: leave empty. That field is a level *advertised* to the client, and this shipper
  does not negotiate it; use `LOG_LEVEL` instead.

The `datalust/seq` container listens on **80** for the full API and UI and on **5341** for an
**ingestion-only** endpoint. The usual `-p 5341:80` mapping means the host's 5341 is the container's
80, so do not infer the internal port from the external one. Point `SEQ_URL` at the container's 5341
over the shared Docker network: a compromised app container can then submit logs but neither read
them nor reach the admin API.

Set a retention policy. 30 days is plenty.

## Operational behaviour

Batches flush on **100 events / 256 KB / 2 s**, whichever comes first.

Seq being unreachable costs log lines and nothing else. A failed batch is **discarded, not
requeued** — retrying a backlog against a dead Seq grows the queue until the process dies — and the
failure is reported to the console at most once every 30 s. Beyond 10 000 queued events the shipper
drops and counts.

Flushes are hooked to `SIGTERM`/`SIGINT`, which Coolify sends on every redeploy, and to `beforeExit`
for scripts. The signal is re-raised after the flush so the default disposition still applies.

## Verifying a change

The one check worth automating in your head: server-only code must not reach the browser bundle.

```bash
pnpm build:dev
grep -rl "async_hooks\|ingest/clef\|SEQ_API_KEY" .output/public   # must print nothing
```

## Querying Seq

```
Source = 'fn' and Elapsed > 500              slow endpoints
DbQueries > 20                               an N+1, without having to suspect one first
@Level = 'Error' and Environment = 'preview' what broke while testing
@tr = '4bf92f35…'                            everything one request did
Outcome = 'failed' and Fn = 'startQuizFn'    one endpoint's bugs, excluding its rejections
```

When a user reports an error, the toast carries the first 8 characters of the trace id
(`(rif. 4bf92f35)`). `@tr like '4bf92f35%'` goes straight to it.

## Not built yet

**Browser errors.** The API key can never reach the bundle, so client reporting needs a server route
to proxy it — accepting a strict schema, rate-limited, re-stamping `Source=browser` server-side. It
would send unhandled errors, the root `errorComponent`, and failed mutations. Not navigation
breadcrumbs or clicks: that is product analytics, and it would multiply the volume.

**Spans.** Nothing writes `@sp` today. The database, Supabase auth and nodemailer are the three
call sites that would justify it.
