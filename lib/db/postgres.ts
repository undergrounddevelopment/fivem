import postgres from "postgres"

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || ""

if (!connectionString) {
  console.warn("[Database] No direct PostgreSQL connection string found. Using Supabase client instead.")
}

const sql = connectionString
  ? postgres(connectionString, {
      ssl: connectionString.includes("supabase") || connectionString.includes("neon") ? "require" : false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
    })
  : null

export default sql ||
  ({
    query: () => Promise.resolve([]),
    unsafe: () => Promise.resolve([]),
    begin: () => Promise.resolve({ commit: () => {}, rollback: () => {} }),
  } as any)
