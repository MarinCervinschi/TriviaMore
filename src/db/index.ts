import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

type Db = ReturnType<typeof createDb>

let _pool: Pool | null = null
let _db: Db | null = null

function createDb(pool: Pool) {
  return drizzle(pool, { schema, casing: "snake_case" })
}

// Lazy because entry-server.tsx loads secrets on the first request, so
// DATABASE_URL is absent at module evaluation time.
export function getDb(): Db {
  if (_db) return _db

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL is not set")

  _pool = new Pool({ connectionString, max: 10 })
  // An idle client can fail outside any query; unhandled, it crashes the process.
  _pool.on("error", (err) => {
    console.error("[db] idle client error:", err)
  })

  _db = createDb(_pool)
  return _db
}

export async function closeDb() {
  if (!_pool) return
  await _pool.end()
  _pool = null
  _db = null
}
