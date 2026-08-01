# Frozen archive

These 20 migrations built the schema up to the Drizzle cut-over. **Nothing new goes here.**

Schema changes now go through Drizzle Code First — edit `src/db/schema/Entities/`, then
`pnpm db:generate` + `pnpm db:migrate`. See the Database section of the root README.

They are kept because they are the history of how the production database reached its
current shape, and because `supabase db reset` still uses them to build a local database
with the RLS policies the application needs until phases #90/#91 move data access to
Drizzle. The Drizzle baseline (`drizzle/0000_baseline.sql`) describes the **target**
schema, which deliberately has no policies — a database built from it is not yet a
drop-in replacement for one built from here.
