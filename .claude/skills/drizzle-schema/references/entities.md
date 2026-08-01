# Entities

One file per table, under `src/db/schema/entities/<postgres-schema>/`.

## Shape of an entity file

`public` tables use `pgTable`; `catalog` and `quiz` tables use the schema handle from `common.ts`.

```ts
import { index, integer, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

import { catalogSchema } from "../../common"
import { departmentAreaEnum } from "./enums"

export const departments = catalogSchema
  .table(
    "departments",
    {
      id: uuid().defaultRandom().primaryKey().notNull(),
      name: text().notNull(),
      code: text().notNull(),
      area: departmentAreaEnum(),
      position: integer().default(0).notNull(),
      createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      index("idx_departments_position").using(
        "btree",
        table.position.asc().nullsLast().op("int4_ops"),
      ),
      unique("departments_code_key").on(table.code),
    ],
  )
  .enableRLS()
```

Rules that matter:

- **Column names.** A camelCase TS key needs its snake_case SQL name spelled out —
  `departmentId: uuid("department_id")`. Single-word columns can omit it (`name: text()`).
- **Timestamps are `mode: "string"`.** They surface as ISO strings, matching what the app already
  passes around. Switching to `mode: "date"` changes every consumer.
- **Constraint and index names are explicit and match the database.** Postgres autogenerates
  `<table>_<cols>_key` / `<table>_<col>_fkey`; keep those exact strings or the next diff renames
  things.
- **`.enableRLS()` on every table.** No `pgPolicy` — see the SKILL for why.

## Foreign keys

Always the explicit `foreignKey({...})` form in the third argument, never `.references()` inline:
the name has to be pinned.

```ts
foreignKey({
  columns: [table.sectionId],
  foreignColumns: [sections.id],
  name: "questions_section_id_fkey",
}).onDelete("cascade"),
```

A composite primary key is `primaryKey({ columns: [...], name: "<table>_pkey" })`.

Foreign keys are the only place an entity may import another entity at module scope. That import
graph must stay a DAG — child imports parent, never the reverse.

To reference `auth.users` (owned by GoTrue, outside our schema):

```ts
import { authUsers } from "drizzle-orm/supabase"

foreignKey({ columns: [table.id], foreignColumns: [authUsers.id], name: "profiles_id_fkey" })
```

`schemaFilter` keeps `auth` out of migrations, so the table is referenced but never managed.

## Enums

All enum types live in the **`public`** Postgres schema — they are shared across the three schemas.
Declare them with `pgEnum`, never `catalogSchema.enum()`, or you will move the type and break every
column using it. The folder a `enums.ts` sits in is organisational only.

```ts
import { pgEnum } from "drizzle-orm/pg-core"

export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD"])
```

Adding a value is a plain schema edit. **Removing one is not** — Postgres has no `DROP VALUE`; it
needs a custom migration that renames the type, recreates it, casts every column and drops the old
type (see `supabase/migrations/00012` for a worked example).

## Generated columns

`tsvector` needs the custom type from `common.ts`. Copy the expression in the exact form Postgres
normalises it to (`'italian'::regconfig`, `''::text`) — a cosmetic difference reads as a change.

```ts
fts: tsvector("fts").generatedAlwaysAs(
  sql`to_tsvector('italian'::regconfig, COALESCE(name, ''::text))`,
),
```

Generated columns cannot be altered in place: changing the expression means dropping and recreating
the column and its indexes, in a custom migration.

## Indexes — two real traps

**`.desc()` is silently dropped when combined with `.op()`.** Write descending indexes without the
opclass:

```ts
index("idx_notifications_created_at").using("btree", table.createdAt.desc().nullsFirst()),
```

**Column order in composite keys.** `drizzle-kit pull` has been observed emitting the columns of a
composite unique in the wrong order and assigning opclasses shifted by one position (`text_ops` on a
`uuid` column). Never copy introspection output without checking it against:

```bash
docker exec supabase_db_TriviaMore psql -U postgres -d postgres \
  -c "select indexdef from pg_indexes where indexname = '<name>'"
```

## Check constraints

```ts
check("questions_options_shape_check", sql`(...)`),
```

Copy the expression from `pg_get_constraintdef()`, not from the original migration — Postgres stores
a normalised form and any difference shows up as a diff forever.

## Relations

In the per-schema `relations.ts`, never in the entity file.

```ts
export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class: one(classes, { fields: [sections.classId], references: [classes.id] }),
  questions: many(questions),
}))
```

A relation belongs to the folder of the table that **owns** it — the first argument — even when it
points at another schema.

Two relations between the same pair of tables need a `relationName` on **both** sides, or Drizzle
cannot tell them apart:

```ts
// content-requests: author and handler both point at profiles
user:    one(profiles, { ..., relationName: "contentRequestAuthor" }),
handler: one(profiles, { ..., relationName: "contentRequestHandler" }),
```

Relations are ORM-only. Adding, changing or removing one must produce `No schema changes` from
`db:generate`. If it doesn't, an entity was touched by mistake.

## Row types

Derived, in `src/lib/<domain>/types.ts`:

```ts
import type { courses } from "@/db/schema"

export type Course = typeof courses.$inferSelect
export type NewCourse = typeof courses.$inferInsert
export type BrowseCourse = Course & { classes: { count: number }[] }
```

Inferred keys are **camelCase** (`departmentId`, `createdAt`), unlike the snake_case shapes the old
supabase-js types produced. When converting a file, expect field renames to propagate into
components — the typechecker finds every site.

## Checklist for a new table

1. Create `entities/<schema>/<plural-kebab>.ts` with columns, indexes, constraints, FKs, `.enableRLS()`.
2. Add relations to that schema's `relations.ts`.
3. Add both to `src/db/schema/index.ts`.
4. `pnpm db:generate --name add_<table>` and read the SQL before applying.
5. Derive row types where they are consumed.
