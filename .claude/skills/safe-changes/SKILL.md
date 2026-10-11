---
name: safe-changes
description: How TriviaMore changes its schema and its server functions without breaking the version that is still running — expand/contract, deprecating before dropping, the Postgres locks a migration can take, data backfills, versioning a server function, and the release order. Use whenever writing or reviewing a migration, changing a column, constraint, index or enum, changing a server function's input or behaviour, or planning what goes into a release.
---

# Safe changes

Two versions of TriviaMore always overlap. During a deploy the old container still serves requests while the
new one starts, a browser tab opened before the deploy keeps calling the old server functions, and on staging a
migration is applied before the code that uses it is merged. Every change therefore has to work with the code of
the release before it and the release after it.

The rule that follows from it: **every migration is backward compatible.** A change that is not gets split into
steps that each are, shipped in separate releases.

## Expand, migrate, contract

Any change that removes or reshapes something goes through three phases, each its own release:

1. **Expand.** Add the new structure next to the old. Nothing that exists changes.
2. **Migrate.** The code writes both, the data is copied over, then the code reads only the new one.
3. **Contract.** Remove the old structure, once no running version reads it.

A drop is always a contract step. It never ships in the release that stops using the column.

## The schema

| Change | How |
|---|---|
| Add a column | nullable, or with a constant default. Never `NOT NULL` without a default on an existing table |
| Drop a column | mark it obsolete (`@deprecated` on the Drizzle column, `COMMENT ON COLUMN` in SQL), stop using it, drop it in a later release |
| Rename a column | add the new one, write both and copy the data, read the new one, drop the old. Never `RENAME` |
| Change a type | a new column of the new type, the same steps as a rename |
| `NOT NULL` on an existing column | backfill, `ADD CONSTRAINT … CHECK (col IS NOT NULL) NOT VALID`, `VALIDATE CONSTRAINT`, then `SET NOT NULL`, which uses the valid check instead of scanning |
| A new foreign key or check | `NOT VALID` first, `VALIDATE CONSTRAINT` in a second statement |
| An index on a table with data | `CREATE INDEX CONCURRENTLY`. It cannot run inside a transaction, and `scripts/db/migrations.ts` opens one per migration, so such a migration needs the script's exception |
| An enum value | add only, never remove, and never use a value in the transaction that added it |
| Drop a table | the same as a column: unused for a release first |

**Locks.** Most `ALTER TABLE` forms take an `ACCESS EXCLUSIVE` lock, and every query on the table queues
behind it, including the ones that arrive after. Start each migration that alters a table with
`SET lock_timeout = '5s';`, so a migration that cannot get its lock fails fast and is retried, instead of
stalling the app.

**Backfills go in a job.** Filling existing rows goes in a console job that works in batches, never inside a
migration. A migration that updates a large table holds its locks for the whole update.

## Server functions

A server function's id is a hash of its file and export name, and a tab opened before a deploy keeps that id.
The input it sends is the shape the old client knew.

- **An input only grows.** New fields are optional, with the old behaviour when they are absent. A field never
  becomes required and never changes meaning.
- **A changed behaviour is a new function.** Write `startQuizV2Fn` next to `startQuizFn`, move the client to
  it, and delete the old one in a later release.
- **A changed output only grows**, for the same reason: old clients read the fields they know.
- **Moving or renaming a server function** is a removal for any open tab. Do it in a release where that is
  acceptable, and know that those tabs need a reload (the `server-functions` skill shows the two errors).

## Releases

- **Order:** expand migration, then the code, then the contract migration in a later release. In production the
  pipeline applies the migrations before the deploy.
- **Every release must run on the schema of the release after it**, which is what staging proves: there the
  migrations land before the code.
- **A feature flag** separates turning a behaviour on from deploying it, when the change is risky or needs data
  first.
- **Rolling back a deploy does not roll back the schema.** A release whose migrations are all expand steps can
  be rolled back by redeploying the previous image.

## Staging and production

- **Staging** may receive a migration from a local checkout before it is merged. If the migration is then
  changed, staging holds a version the file no longer describes: rebuild staging with `db:reset-staging`
  instead of repairing it. That script arrives with staging, phase 3 of `docs/PLATFORM.md`.
- **Production** receives migrations only from the pipeline, after a backup and an approval. Until the pipeline
  exists, by hand with `scripts/db/migrations.ts`.
- Two branches must not both add a migration with the same number. Rebase and regenerate before merging.

## Reviewing a migration

- [ ] Could the code of the previous release run on this schema?
- [ ] Is there a `DROP`, a `RENAME`, a type change or a new `NOT NULL`? Then it is a contract step: is the code
      that stopped using it already released?
- [ ] Does it alter a table the app writes to? Then it sets `lock_timeout`.
- [ ] Does it create an index on a table with data? Then `CONCURRENTLY`, outside a transaction.
- [ ] Does it update rows? Then the update belongs in a job.
