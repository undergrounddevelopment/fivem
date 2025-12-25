import { getSupabaseAdminClient } from "./supabase/server"

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export async function getDb() {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
    console.error("[CRITICAL] DATABASE_URL is not set")
    throw new Error("DATABASE_URL environment variable is missing")
  }

  // In production, if DATABASE_URL is missing, it will fail at runtime which is expected
  return await getSupabaseAdminClient()
}

// Export prisma as an alias that throws a helpful error
export const prisma = new Proxy({} as any, {
  get: () => {
    throw new Error("Prisma has been replaced with Supabase. Use getDb() or getSupabaseAdminClient() instead.")
  },
})

// For backwards compatibility, maintain the globalForPrisma logic
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
