import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || ""

if (!connectionString) {
  console.warn("[Database] No direct PostgreSQL connection string found. Using Supabase client instead.")
}

const sslEnabled =
  /sslmode=require/i.test(connectionString) ||
  connectionString.includes("supabase") ||
  connectionString.includes("neon") ||
  connectionString.includes("akamaidb.net")

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    })
  : null

export const pgPool = pool
export const hasPgConnection = Boolean(pool)

const db = pool
  ? {
      query: async (text: string, params: any[] = []) => {
        const res = await pool.query(text, params)
        return res.rows
      },
      unsafe: async (text: string, params: any[] = []) => {
        const res = await pool.query(text, params)
        return res.rows
      },
      begin: async () => {
        const client = await pool.connect()
        await client.query("BEGIN")
        return {
          commit: async () => {
            try {
              await client.query("COMMIT")
            } finally {
              client.release()
            }
          },
          rollback: async () => {
            try {
              await client.query("ROLLBACK")
            } finally {
              client.release()
            }
          },
        }
      },
    }
  : null

export default db ||
  ({
    query: () => Promise.resolve([]),
    unsafe: () => Promise.resolve([]),
    begin: () => Promise.resolve({ commit: () => {}, rollback: () => {} }),
  } as any)
