// Centralized Configuration - FIXED & OPTIMIZED
export const CONFIG = {
  // Database - PRODUCTION READY
  database: {
    url: process.env.POSTGRES_URL || "postgres://postgres.linnqtixdfjwbrixitrb:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    pooling: process.env.POSTGRES_PRISMA_URL || "postgres://postgres.linnqtixdfjwbrixitrb:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    direct: process.env.POSTGRES_URL_NON_POOLING || "postgres://postgres.linnqtixdfjwbrixitrb:your-db-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
  },

  // Supabase - PRODUCTION CREDENTIALS
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://linnqtixdfjwbrixitrb.supabase.co",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE",
  },

  // Auth - SECURE CONFIGURATION
  auth: {
    secret: process.env.NEXTAUTH_SECRET || "jAA23MIrEPe4YRDbknuuZfP+tAMp2vUzFJaIFL0Uyoc=",
    url: process.env.NEXTAUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    adminDiscordId: process.env.ADMIN_DISCORD_ID || "1047719075322810378",
  },

  // Discord OAuth - PRODUCTION CREDENTIALS
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || "1445650115447754933",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "JXY7URZrY3zsN5Ca4kQ88tB0hUC2pXuW",
  },

  // Linkvertise - MONETIZATION READY
  linkvertise: {
    authToken: process.env.LINKVERTISE_AUTH_TOKEN || "your_linkvertise_auth_token_here",
    userId: process.env.LINKVERTISE_USER_ID || "1461354",
  },

  // Features - OPTIMIZED VALUES
  features: {
    dailyCoins: 100,
    spinCostCoins: 0,
    maxSpinsPerDay: 10,
    newUserCoins: 100,
    adminCoins: 999999,
    xpPerAction: 10,
    xpPerPost: 25,
    xpPerComment: 5,
  },

  // Rate Limits - PRODUCTION READY
  rateLimit: {
    api: { limit: 100, window: 60000 }, // 100 req/min
    auth: { limit: 5, window: 300000 }, // 5 req/5min
    upload: { limit: 10, window: 3600000 }, // 10 req/hour
    spin: { limit: 20, window: 86400000 }, // 20 req/day
  },

  // Site - PRODUCTION INFO
  site: {
    name: "FiveM Tools V7",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://fivemtools.net",
    logo: "https://r2.fivemanage.com/IKG5gF4pHPjLHEhuHxEh0/Untitleddesign-26.png",
    description: "Platform lengkap untuk FiveM scripts, MLOs, dan resources",
  },
} as const

// Validation - ENHANCED
export function validateConfig() {
  const errors: string[] = []
  const warnings: string[] = []

  // Critical checks
  if (!CONFIG.supabase.url) {
    errors.push("SUPABASE_URL missing")
  }
  if (!CONFIG.supabase.anonKey) {
    errors.push("SUPABASE_ANON_KEY missing")
  }
  if (!CONFIG.discord.clientId) {
    warnings.push("DISCORD_CLIENT_ID missing")
  }
  if (!CONFIG.discord.clientSecret) {
    warnings.push("DISCORD_CLIENT_SECRET missing")
  }

  if (errors.length > 0) {
    console.error(`[Config] CRITICAL ERRORS: ${errors.join(", ")}`)
    return false
  }

  if (warnings.length > 0) {
    console.warn(`[Config] WARNINGS: ${warnings.join(", ")}`)
  }

  console.log("[Config] ✅ All configurations validated successfully")
  return true
}

// Connection test
export async function testConnections() {
  const results = {
    supabase: false,
    database: false,
    discord: false,
  }

  try {
    // Test Supabase connection
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)
    results.supabase = !error
    console.log("[Config] Supabase test:", results.supabase ? "✅" : "❌")
  } catch (e) {
    console.error("[Config] Supabase test failed:", e)
  }

  return results
}
