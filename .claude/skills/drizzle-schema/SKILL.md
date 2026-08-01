---
name: drizzle-schema
description: Conventions for the Drizzle data layer in TriviaMore — adding or changing a table, columns, enums, foreign keys, relations, indexes and row types, and generating/applying migrations. Use whenever work touches src/db/schema/, drizzle/, a database column or table, a migration, or a type derived from a table. Also use before writing any raw SQL that has to survive a rebuild.
---

# Drizzle schema

The TypeScript schema is the source of truth. `drizzle-kit` diffs it and writes SQL; the database is
never edited directly. Same model as EF Core Code First: `db:generate` ↔ `migrations add`,
`db:migrate` ↔ `database update`, `--custom` ↔ `migrationBuilder.Sql(...)`.

`supabase/migrations/` is a frozen archive from before the cut-over. Nothing new goes there.

## Layout

```
src/db/
├── index.ts                   getDb() — lazy pool, DATABASE_URL read after secrets load
└── schema/
    ├── common.ts              catalogSchema / quizSchema handles, tsvector custom type
    ├── index.ts               barrel: runtime client + db.query relations
    └── entities/
        ├── public/            one file per table + enums.ts + relations.ts
        ├── catalog/
        └── quiz/
```

`drizzle.config.ts` points at the **folder**, not the barrel, so a forgotten export can never
silently drop a table from a migration. The barrel still matters: it feeds `import * as schema` in
`src/db/index.ts`, which is what makes `db.query` and relations work.

## Naming

| Thing | Convention | Example |
|---|---|---|
| File | plural, kebab-case, mirrors the table | `quiz-attempts.ts` |
| Table object | plural camelCase, mirrors the SQL name | `quizAttempts` |
| Relations | `<table>Relations` | `quizAttemptsRelations` |
| Enum | `<name>Enum` | `difficultyEnum` |
| Row type | singular PascalCase, **derived** | `type Course = typeof courses.$inferSelect` |
| Insert type | `New<Row>`, derived | `type NewCourse = typeof courses.$inferInsert` |

Row types are never hand-written and never live in `src/db/`. They belong in `src/lib/<domain>/types.ts`
next to the view models built on them (`BrowseCourse = Course & {...}`). A plural table object and a
singular type never collide, and TypeScript keeps values and types in separate namespaces anyway.

## The one structural rule

**Relations files import entities. Entities never import relations.**

An entity file contains only what ends up in a migration: columns, indexes, constraints, foreign
keys. Relations produce no DDL — they exist solely to feed `db.query` — and live in the per-schema
`relations.ts`.

This is not stylistic. Foreign keys resolve at module scope and their graph is a DAG; relations
resolve lazily. Putting relations in entity files creates ~100 import cycles that work by accident
and break the moment a table is referenced at module scope outside a `foreignKey` or a `relations`
callback, with an error pointing at the wrong file.

For the same reason: never reference another table at module scope except inside `foreignKey({...})`
or a `relations()` callback.

## Workflows

Adding or changing a table, column, index or constraint → `references/entities.md`.

Generating and applying a migration, and everything the DSL cannot express (triggers, functions,
grants, policies, seed rows) → `references/migrations.md`.

## Non-negotiables

- **Migrations are applied by hand.** Never in a container start command, entrypoint or automatic
  deploy hook, in any environment. Migration first, code second; expand/contract for destructive
  changes, because rolling back a deploy does not roll back the schema.
- **There is no `db:push`.** Always generate + migrate, so every change leaves a reviewable file.
- **Commit the TS change and the generated `.sql` together**, plus the `drizzle/meta/` snapshot.
- **Never hand-edit a `.sql` file that has already been applied anywhere.** Write a new migration.
- **Every table gets `.enableRLS()`** and no policies. Deny-all is the target; the application
  connects with a role that bypasses RLS. The only policies in the schema are the two on
  `storage.objects`, and they live in a custom migration.

## Verifying

`pnpm exec tsc --noEmit` is necessary but proves nothing about SQL. For anything beyond a trivial
column, rebuild from zero and diff — the recipe is in `references/migrations.md`. It has already
caught an inverted composite unique key and two indexes that silently lost their `DESC`.

A refactor that is supposed to be DDL-neutral (renaming exports, moving relations) must produce
`No schema changes, nothing to migrate` from `pnpm db:generate`. If it doesn't, something moved that
shouldn't have.
