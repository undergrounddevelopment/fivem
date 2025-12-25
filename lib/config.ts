// Centralized Configuration
export const CONFIG = {
  // Database
  database: {
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    pooling: process.env.POSTGRES_PRISMA_URL,
    direct: process.env.POSTGRES_URL_NON_POOLING,
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Auth
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    adminDiscordId: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
  },

  // Discord OAuth
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  },

  // Linkvertise
  linkvertise: {
    authToken: process.env.LINKVERTISE_AUTH_TOKEN,
    userId: process.env.LINKVERTISE_USER_ID,
  },

  // Features
  features: {
    dailyCoins: 100,
    spinCostCoins: 0,
    maxSpinsPerDay: 10,
    newUserCoins: 100,
    adminCoins: 999999,
  },

  // Rate Limits
  rateLimit: {
    api: { limit: 100, window: 60000 }, // 100 req/min
    auth: { limit: 5, window: 300000 }, // 5 req/5min
    upload: { limit: 10, window: 3600000 }, // 10 req/hour
    spin: { limit: 20, window: 86400000 }, // 20 req/day
  },

  // Site
  site: {
    name: 'FiveM Tools V7',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fivemtools.net',
    logo: 'https://r2.fivemanage.com/IKG5gF4pHPjLHEhuHxEh0/Untitleddesign-26.png',
  },
} as const

// Validation
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}
